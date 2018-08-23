import * as  _ from "lodash";
import { EntityTypeCfg } from '../interfaces';
import { IEntityStore } from './interfaces';
import {extras,observable} from "mobx";
import { lazy, Lazy } from '../utils/lazy';

export class EntityPropCfg {
  name?: string;

  referenceTypeName?: string;
  isReference?: boolean;
  referencePropName?: string;

  isLazy?: boolean;
  isNested?: boolean;
  nestedTypeName?: string;

  isNestedCollection?: boolean;
  nestedCollTypeName?: string;
  isKey?: boolean;
}

export class EntityTypeMeta {
  props: EntityPropMeta[];
  typeName: string;

  constructor(cfg: EntityTypeCfg) {
    this.props = cfg.props.map(x => new EntityPropMeta(x));
    this.typeName = cfg.typeName;
  }

  getProp(name: string): EntityPropMeta {
    return this.props.find(x => x.name === name);
  }
}

export class EntityPropMeta extends EntityPropCfg {

  constructor(cfg: EntityPropCfg) {
    super();
    _.extend(this as any, cfg);
  }

  isSimple() {
    return !this.isNested && !this.isReference && !this.isNestedCollection;
  }
}

export class EntityMetaProvider {
  private metas: {};
  stores = {};
  private ctors = {};
  private lazyCtors = {};

  constructor(types:EntityTypeCfg[]) {
    this.metas = types.reduce((x, v) => {
      x[v.typeName] = new EntityTypeMeta(v);
      return x;
    }, {});
  }

  addMeta(m: EntityTypeMeta) {
    this.metas[m.typeName] = m;
  }

  getType(typeName: string): EntityTypeMeta {
    return this.metas[typeName];
  }

  getIdField(typeName) {
    let t: EntityTypeMeta = this.metas[typeName];
    return t.props.find(x => x.isKey).name;
  }

  regStore<T>(typeName, store: IEntityStore<T>) {
    this.stores[typeName] = store;
  }

  getLazyCtor(rootType, field, realCtor, isCollection): (v, d?) => void {
    function wrapValue(v) {
      if (!isCollection)
        return new realCtor(v);
      else {
        v = v || [];
        let r = [];
        for (let i = 0; i < v.length; i++) {
          let obj = v[i];
          r.push(new realCtor(obj));
        }
        return r;
      }
    }

    let cache_key = rootType + "_" + field;

    if (this.lazyCtors[cache_key]) {
      return this.lazyCtors[cache_key];
    }

    let self = this;
    let ctor = function (entityId, owner) {
      this.entityId = entityId;
      this.owner = owner;
    };
    ctor.prototype.get = async function () {
      if (this.loadedValue)
        return this.loadedValue;

      let store = self.stores[rootType] as IEntityStore<any>;

      let getPromise = () => {
        if (this.promise) {
          return this.promise;
        }
        let promise = store.loadFieldValue(this.entityId, field).then(async v => {
            this.loadedValue = wrapValue(v);
            this.owner.version.set(this.owner.__version++);
            await store.saveLoadedFieldOffline(this.entityId, field, v);
          },
          err => {
            this.promise = null;
            return Promise.reject(err);
          });
        this.promise = promise;
        return promise;
      };

      await getPromise();
      return this.loadedValue;
    };
    ctor.prototype.getCached = function (loadIfMissing?: boolean, defaultValue?) {
      if (!this.loadedValue && loadIfMissing)
        this.get();
      return this.loadedValue == null ? defaultValue : this.loadedValue;
    };

    this.lazyCtors[cache_key] = ctor;
    return ctor;
  }

  getEntityCtor(typeName): (v, d?) => void {
    if (this.ctors[typeName]) {
      return this.ctors[typeName];
    }

    let meta = this.metas[typeName] as EntityTypeMeta;
    let nestedColls = meta.props.filter(x => x.isNestedCollection);
    let nestedProps = meta.props.filter(x => x.isNested);
    let refProps = meta.props.filter(x => x.isReference);
    let nonrefProps = meta.props.filter(x => !x.isReference);
    let self = this;

    let ctor = function (vals, depth) {
      if (depth > 30) {
        console.log("Stack overflow detected!", vals);
        throw new Error("Stack overflow detected!");
      }

      extras.allowStateChanges(true, () => {
        this.version = observable.box(1);
        this.__version = 1;
        this.setVals(vals, depth);
      });
    };
    this.ctors[typeName] = ctor;
    ctor.prototype.__isEntityProxy = true;
    ctor.prototype.listen = function () {
      this.version.get();
    };
    ctor.prototype.setVals = function (vals, depth) {
      if (!vals)
        vals = {};

      this.vals = vals;
      this.wraps = {};
      let owner = this;
      for (let i = 0; i < nestedProps.length; i++) {
        let prop = nestedProps[i];
        if (prop.isLazy) {
          if (depth > 1)
            throw "Oh! nested lazy are not supported [yet]!";
          let v = Lazy.unwrap(vals[prop.name]);

          if (v) {
            let c = self.getEntityCtor(prop.nestedTypeName);
            v = new c(v, depth + 1);
            this.wraps[prop.name] = lazy(v);
          }
          else {
            let c = self.getEntityCtor(prop.nestedTypeName);
            let lz = self.getLazyCtor(typeName, prop.name, c, false);
            let key = vals[self.getIdField(typeName)];
            v = new lz(key, owner);
            this.wraps[prop.name] = v;
          }
        }
        else {
          let v = vals[prop.name];
          if (v) {
            let c = self.getEntityCtor(prop.nestedTypeName);
            v = new c(v, depth + 1);
          }
          this.wraps[prop.name] = v;
        }
      }
      for (let i = 0; i < nestedColls.length; i++) {
        let prop = nestedColls[i];
        let loadedVal = Lazy.unwrap(vals[prop.name]);
        if (loadedVal != null) {
          let array = [];
          let v = vals[prop.name] || [];
          let ctor = self.getEntityCtor(prop.nestedCollTypeName);
          for (let j = 0; j < v.length; j++) {
            let item = v[j];
            array[j] = new ctor(item, depth + 1);
          }
          if (!prop.isLazy)
            this.wraps[prop.name] = array;
          else
            this.wraps[prop.name] = Lazy.wrap(array);
        }
        else {
          if (!prop.isLazy)
            this.wraps[prop.name] = [];
          else {
            let ctor = self.getEntityCtor(prop.nestedCollTypeName);
            let lz = self.getLazyCtor(typeName, prop.name, ctor, true);
            let key = vals[self.getIdField(typeName)];
            let v = new lz(key, owner);
            this.wraps[prop.name] = v;
          }
        }
      }

      this.version.set(this.__version++);
    };

    for (let i = 0; i < nonrefProps.length; i++) {
      let prop = nonrefProps[i];
      if (prop.isNested || prop.isNestedCollection) {
        Object.defineProperty(ctor.prototype, prop.name, {
          get: function () {
            this.listen();
            return this.wraps[prop.name];
          },
        });
      } else {
        Object.defineProperty(ctor.prototype, prop.name, {
          get: function () {
            this.listen();
            if (!this.vals) {
              console.log("Invalid access!!" + prop.name);
              return null;
            }
            return this.vals[prop.name];
          },
        });
      }

    }

    for (let i = 0; i < refProps.length; i++) {
      let prop = refProps[i];

      Object.defineProperty(ctor.prototype, prop.name, {
        get: function () {
          let refVal = this.vals[prop.referencePropName];
          if (!refVal) {
            return null;
          }

          let store = self.stores[prop.referenceTypeName] as IEntityStore<any>;
          let cached = store.getCached(refVal);
          if (!cached) {
            let self = this;
            self.version.get();
            if (self["_preloaded_" + prop.name])
              return cached;

            self["_preloaded_" + prop.name] = true;

            store.getItem(refVal).then(() => {
              self.version.set(self.__version++);
            });
          }

          return cached;
        }
      });
    }
    return ctor;
  }

  tryGetKeyGetter(itemType: EntityTypeMeta) {
    let keyProps = [];
    let idFields = itemType.props.filter(x => x.isKey);
    if (idFields.length === 0) {
      return null;
    }

    return function (o) {
      let k = "";
      for (let i = 0; i < idFields.length; i++) {
        let keyPart = o[idFields[i].name];
        if (keyPart) {
          k += keyPart;
        }
      }
      return k || null;
    };
  }
}
