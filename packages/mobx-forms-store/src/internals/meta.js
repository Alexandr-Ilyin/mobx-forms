"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const mobx_1 = require("mobx");
const lazy_1 = require("../utils/lazy");
class EntityPropCfg {
}
exports.EntityPropCfg = EntityPropCfg;
class EntityTypeMeta {
    constructor(cfg) {
        this.props = cfg.props.map(x => new EntityPropMeta(x));
        this.typeName = cfg.typeName;
    }
    getProp(name) {
        return this.props.find(x => x.name === name);
    }
}
exports.EntityTypeMeta = EntityTypeMeta;
class EntityPropMeta extends EntityPropCfg {
    constructor(cfg) {
        super();
        _.extend(this, cfg);
    }
    isSimple() {
        return !this.isNested && !this.isReference && !this.isNestedCollection;
    }
}
exports.EntityPropMeta = EntityPropMeta;
class EntityMetaProvider {
    constructor(types) {
        this.stores = {};
        this.ctors = {};
        this.lazyCtors = {};
        this.metas = types.reduce((x, v) => {
            x[v.typeName] = new EntityTypeMeta(v);
            return x;
        }, {});
    }
    addMeta(m) {
        this.metas[m.typeName] = m;
    }
    getType(typeName) {
        return this.metas[typeName];
    }
    getIdField(typeName) {
        let t = this.metas[typeName];
        return t.props.find(x => x.isKey).name;
    }
    regStore(typeName, store) {
        this.stores[typeName] = store;
    }
    getLazyCtor(rootType, field, realCtor, isCollection) {
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
        ctor.prototype.get = function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.loadedValue)
                    return this.loadedValue;
                let store = self.stores[rootType];
                let getPromise = () => {
                    if (this.promise) {
                        return this.promise;
                    }
                    let promise = store.loadFieldValue(this.entityId, field).then((v) => __awaiter(this, void 0, void 0, function* () {
                        this.loadedValue = wrapValue(v);
                        this.owner.version.set(this.owner.__version++);
                        yield store.saveLoadedFieldOffline(this.entityId, field, v);
                    }), err => {
                        this.promise = null;
                        return Promise.reject(err);
                    });
                    this.promise = promise;
                    return promise;
                };
                yield getPromise();
                return this.loadedValue;
            });
        };
        ctor.prototype.getCached = function (loadIfMissing, defaultValue) {
            if (!this.loadedValue && loadIfMissing)
                this.get();
            return this.loadedValue == null ? defaultValue : this.loadedValue;
        };
        this.lazyCtors[cache_key] = ctor;
        return ctor;
    }
    getEntityCtor(typeName) {
        if (this.ctors[typeName]) {
            return this.ctors[typeName];
        }
        let meta = this.metas[typeName];
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
            mobx_1.extras.allowStateChanges(true, () => {
                this.version = mobx_1.observable.box(1);
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
                    let v = lazy_1.Lazy.unwrap(vals[prop.name]);
                    if (v) {
                        let c = self.getEntityCtor(prop.nestedTypeName);
                        v = new c(v, depth + 1);
                        this.wraps[prop.name] = lazy_1.lazy(v);
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
                let loadedVal = lazy_1.Lazy.unwrap(vals[prop.name]);
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
                        this.wraps[prop.name] = lazy_1.Lazy.wrap(array);
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
            }
            else {
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
                    let store = self.stores[prop.referenceTypeName];
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
    tryGetKeyGetter(itemType) {
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
exports.EntityMetaProvider = EntityMetaProvider;
