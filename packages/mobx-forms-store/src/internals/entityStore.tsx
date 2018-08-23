import * as  _ from "lodash";
import { Progress } from '../utils/progress';
import { observable } from 'mobx';
import { EntityStatus, EntityTypeCfg, ILogStorage, IOfflineStore, IOnlineStore, UpdateOptions, } from '../interfaces';
import { Queue } from '../utils/queue';
import { EntityMetaProvider, EntityPropMeta, EntityTypeMeta } from './meta';
import { getOfflineError, isOffline, isOnline, offlineRetry } from './offlines';
import { wait } from '../utils/wait';
import { wrapAsync } from '../utils/trackAsync';
import { ILazyWrapper, Lazy, LazyValue } from '../utils/lazy';
import { EntityMerger } from './entityMerger';
import { guid } from '../utils/guid';
import { foreach } from '../utils/foreach';
import { IEntityStore } from './interfaces';

var _logType = null;
var _logStore = false;

export class Entity<T> {
  __id: any;
  __store: EntityStore<T>;
  __version = 0;
  __serverValues: T;
  __clientValues: T;
  __status: EntityStatus = EntityStatus.Unchanged;

  __queue = new Queue();
  __saveQueue: Queue;

  __loadedOfflineChanges;
  __loadedOnlineVersion;
  __isNew;

  __valuesWrapper = null;

  get saveQueue() {
    if (!this.__saveQueue) {
      this.__saveQueue = new Queue();
    }
    return this.__saveQueue;
  }

  constructor(store: EntityStore<T>, _id: any) {
    this.__store = store;
    this.__id = _id;
  }

  pushToServer(waitServerSave: boolean): Promise<any> {
    this.log("pushToServer");
    return this.__queue.enqueue(() => this.__pushToServer(waitServerSave));
  }

  setClientValues(newValues: T, final: boolean, waitServer: boolean) {
    this.log("setChangedValues");
    return this.__queue.enqueue(() => this.__setClientValues(newValues, final, waitServer));
  }

  saveFieldOffline(field, value) {
    return this.__queue.enqueue(() => this.__saveFieldOffline(field, value));
  }

  resetValues(): Promise<void> {
    this.log("resetValues");
    return this.__queue.enqueue(() => this.__resetValues());
  }

  refreshValues(): Promise<void> {
    this.log("refreshValues");
    return this.__queue.enqueue(() => this.__refreshValues());
  }

  ensureLoaded(fields?: string[]): Promise<void> {
    this.log("ensureLoaded");
    return this.__queue.enqueue(() => this.__ensureLoaded(fields));
  }

  getValues(): T {
    this.log("getValues");
    return this.__getValues();
  }

  importOfflineValues(newValues: OfflineDataItem<T>) {
    this.log("importOfflineValues");

    if (this.__loadedOfflineChanges) {
      this.log("importOfflineValues - skip");
      return;
    }
    this.__importOfflineValues(newValues);
    this.__updateClientValues();
    this.__loadedOfflineChanges = true;
  }

  __setServerValuesIfExpired(newValues: T) {

    if (this.__serverValues != null && newValues != null) {
      let versionProp = this.__store.getVersionProp();
      if (versionProp != null) {
        if (this.__serverValues[versionProp.name] == newValues[versionProp.name]) {
          return false;
        }
      }
    }
    this.__serverValues = newValues;
    return true;
  }

  importOnlineServerValues(newValues: T) {
    this.log("__importOnlineServerValues");
    let maybeOfflineHasUsefulLazies = this.__serverValues == null;

    if (!this.__setServerValuesIfExpired(newValues)) {
      return;
    }
    this.__isNew = false;
    this.__loadedOnlineVersion = true;
    this.__updateClientValues();
    if (maybeOfflineHasUsefulLazies) {
      this.__queue.enqueue(() => this.__saveImportedValueOffline());
    } else {
      this.__queue.enqueue(() => this.__saveOffline());
    }
  }

  isCreatedOffline() {
    return this.__isNew;
  }

  private async __saveImportedValueOffline() {

    let offline = await this.__store.offlineStore.find(this.__id);
    if (offline != null) {
      if (this.__serverValues != null && offline.serverValues != null) {
        let versionProp = this.__store.getVersionProp();
        if (versionProp != null) {
          if (this.__serverValues[versionProp.name] == offline.serverValues[versionProp.name]) {
            this.__serverValues = offline.serverValues;
            return false;
          }
        }
      }
    }

    await this.__saveOffline();
    return;
  }

  private __importOfflineValues(v: OfflineDataItem<T>) {
    if (this.__loadedOfflineChanges) {
      this.log("skip __importOfflineValues", v);
      return;
    }

    this.__loadedOfflineChanges = true;
    this.log("__importOfflineValues", v);

    if (!this.__clientValues) {
      this.__clientValues = v.clientValues;
      this.__version++;
    }
    if (!this.__serverValues) {
      this.__serverValues = v.serverValues;
    }
    if (this.__status === EntityStatus.Unchanged) {
      this.__status = v.status;
    }
    this.__isNew = v.isNew;
  }

  private async __ensureLoaded(fields?: string[]) {
    this.log("__ensureLoaded");

    if (this.__isNew) {
      return;
    }

    if (isOffline()) {
      let offline = await this.__store.offlineStore.find(this.__id);
      if (offline) {
        this.__importOfflineValues(offline);
      }
      if (!this.__serverValues) {
        throw getOfflineError();
      }
      return;
    }

    if (!this.__loadedOnlineVersion) {
      this.log("Will load online ");
      let onlineVersion = await this.__store.onlineStore.load(this.__id, fields);
      this.__setServerValuesIfExpired(onlineVersion);

      if (onlineVersion == null && this.__serverValues == null) {
        this.logError("Missing object ", this.__store.type.typeName, this.__id);
      }
      this.__loadedOnlineVersion = true;
      await this._ensureLazyLoaded(fields);
      await this.__saveOffline();
    }
    else {
      let alreadyLoaded = await this._ensureLazyLoaded(fields);
      if (!alreadyLoaded) {
        await this.__saveOffline();
      }
    }
  }

  private __canGetValues(): boolean {
    if (this.__isNew) {
      return true;
    }
    return !!(this.__loadedOnlineVersion || this.__loadedOfflineChanges);

  }

  private __getValues(): T {
    if (!this.__canGetValues()) {
      return;
    }
    return this.____getOrCreateWrapper();
  }

  ____getOrCreateWrapper() {
    if (!this.__valuesWrapper) {
      this.__valuesWrapper = new this.__store.entityWrapCtor(this.__getClientValues());
    }
    return this.__valuesWrapper;
  }

  __updateClientValues() {
    this.log("__updateClientValues", this.__serverValues, this.__clientValues);
    if (this.__valuesWrapper) {
      this.__valuesWrapper.setVals(this.__getClientValues());
    }
  }

  __getClientValues() {
    let merged;
    if (!this.__serverValues) {
      merged = this.__clientValues;
    } else if (!this.__clientValues) {
      merged = this.__serverValues;
    } else {
      merged = this.__store.merge(this.__serverValues, this.__clientValues);
    }
    return merged;
  }

  private async __saveFieldOffline(field, value) {
    if (!this.__serverValues) {
      this.logError("Sever values are supposed to be loaded before lazies!");
      return;
    }
    this.__serverValues[field] = value;
    this.__updateClientValues();
    await this.__saveOffline();
  }

  private async __saveOffline() {
    let off: OfflineDataItem<T> = {
      id: this.__id,
      serverValues: this.__serverValues,
      clientValues: this.__clientValues,
      status: this.__status,
      isNew: this.__isNew
    };
    this.log("__saveOffline", off);
    await this.__store.offlineStore.set(this.__id, off);
    if (off.status == EntityStatus.EditFinished || off.status == EntityStatus.EditUnfinished) {
      if (this.__store.logStorage) {
        this.__store.logStorage.writeLog(this.__id, this.__getClientValues());
      }
    }
  }

  private async __pushToServer(waitServerSave: boolean, saveDelay?) {
    if (!this.__store.offlineStore.isPersistent()) {
      waitServerSave = true;
    }
    this.log("__pushToServer..wait:", waitServerSave);
    await this.__ensureLoaded();
    if (this.__status !== EntityStatus.EditFinished) {
      return;
    }
    if (!this.__clientValues) {
      return;
    }

    let _version = this.__version;
    if (saveDelay == null) {
      if (!waitServerSave) {
        saveDelay = this.__store._saveDelay;
      } else {
        saveDelay = 0;
      }
    }

    let savePromise = wait(saveDelay).then(() => {
      return this.saveQueue.enqueue((async () => {
        if (_version !== this.__version) {
          return;
        }

        this.__version++;
        _version = this.__version;

        let pushedVersion;
        if (!this.__serverValues) {
          pushedVersion = this.__clientValues;
        } else {
          pushedVersion = this.__store.merge(this.__serverValues, this.__clientValues);
        }

        this.log("Will push ", pushedVersion);
        let onlineVersion = await this.__store.onlineStore.save(this.__id, pushedVersion, this.__clientValues);
        this.__setServerValuesIfExpired(onlineVersion);
        this.log("Server values=", this.__serverValues);
        this.log("Received server values", onlineVersion);

        if (_version !== this.__version) {
          return;
        }

        this.__clientValues = null;
        this.__status = EntityStatus.Unchanged;
        this.__loadedOnlineVersion = true;
        this.__isNew = false;
        this.__updateClientValues();
        await this.__saveOffline();
      }));
    });
    savePromise = wrapAsync(savePromise);

    if (waitServerSave) {
      await savePromise;
    } else {
      this.log("Server wait skip");
    }
  }

  private logError(a1, a2?, a3?) {
    if (a3) {
      console.log(this.__store.type, this.__id, a1, a2, a3);
    } else if (a2) {
      console.log(this.__store.type, this.__id, a1, a2);
    } else {
      console.log(this.__store.type, this.__id, a1);
    }
  }

  private log(...args) {
    if (!_logStore) {
      return;
    }
    if (_logType != null && this.__store.type.typeName != _logType) {
      return;
    }
    console.log(this.__store.type.typeName, this.__id, ...args);

  }

  private async __setClientValues(newValues: T, unfinished: boolean, waitServer: boolean): Promise<void> {
    this.log("__setChangedValues", newValues);
    await this.__ensureLoaded();
    newValues = this.__store.wrapper.unwrapLazyFields(newValues);
    let newClientValues = null;
    if (!this.__clientValues) {
      newClientValues = newValues;
    } else {
      newClientValues = this.__store.merge(this.__clientValues, newValues);
    }

    this.__clientValues = newClientValues;
    this.__version++;

    if (unfinished) {
      this.__status = EntityStatus.EditUnfinished;
    } else {
      this.__status = EntityStatus.EditFinished;
    }
    this.__updateClientValues();
    await this.__saveOffline();

    if (!unfinished && isOnline()) {
      await this.__pushToServer(waitServer);
    }
    this.log("__setChangedValues-finished", newValues);
  }

  private async __refreshValues() {
    this.log("__reset");
    await this.__ensureLoaded();
    if (this.__isNew) {
      return;
    }
    if (!isOnline() || this.__clientValues) {
      return;
    }
    let newVals = await this.__store.onlineStore.load(this.__id, ["."]);
    let changed = this.__setServerValuesIfExpired(newVals);
    this.__status = EntityStatus.Unchanged;
    if (changed) {
      await this.__saveOffline();
      this.__updateClientValues();
    }
  }

  private async __resetValues() {
    this.log("__reset");
    await this.__ensureLoaded();
    if (this.__isNew) {
      return;
    }
    if (isOnline()) {
      this.log("__reset - go online");
      let serverValues = await this.__store.onlineStore.load(this.__id, ["."]);
      this.__setServerValuesIfExpired(serverValues);
      this.log("__reset - got", this.__serverValues);
    }
    this.__clientValues = null;
    this.__status = EntityStatus.Unchanged;
    await this.__saveOffline();
    this.__updateClientValues();
  }

  private async _ensureLazyLoaded(fields?: string[]): Promise<boolean> {
    if (!fields) {
      return true;
    }
    if (fields.length == 1 && fields[0] == ".") {
      return true;
    }
    let wrapper = this.____getOrCreateWrapper();
    let waits = [];
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let lazy = wrapper[f] as LazyValue<any>;
      if (lazy && lazy.getCached) {
        if (!lazy.getCached()) {
          waits.push(lazy.get());
        }
      }
    }
    await Promise.all(waits);
    return waits.length > 0;
  }
}

export class LazyWrapper implements ILazyWrapper {
  lazyfieldNames: string[];
  provider: EntityMetaProvider;
  private typeName: any;

  constructor(typeName, provider: EntityMetaProvider) {
    this.typeName = typeName;
    this.provider = provider;

  }

  wrapLazyFields<T>(t: T): T {
    if (!t) {
      return t;
    }
    let res: any = {};
    let type = this.provider.getType(this.typeName);
    type.props.forEach(x => {
      let v = t[x.name];
      if (v === undefined) {
        return;
      }
      if (x.isLazy) {
        res[x.name] = Lazy.wrap(v);
      } else {
        res[x.name] = v;
      }
    });
    return res;
  }

  unwrapLazyFields<T>(t: T): T {
    if (!t) {
      return t;
    }
    let res: any = {};
    let type = this.provider.getType(this.typeName);
    type.props.forEach(x => {
      let v = t[x.name];
      if (v === undefined) {
        return;
      }
      if (x.isLazy) {
        res[x.name] = Lazy.unwrap(v);
      } else {
        res[x.name] = v;
      }
    });
    return res;
  }

  getLazyFieldNames(): string[] {
    if (this.lazyfieldNames == null) {
      let type = this.provider.getType(this.typeName);
      this.lazyfieldNames = type.props.filter(x => x.isLazy).map(x => x.name);
    }
    return this.lazyfieldNames;
  }
}


export class OfflineDataItem<T> {
  id: string;
  serverValues: T;
  clientValues: T;
  status: EntityStatus;
  isNew: any;
}

export class EntityStore<T> implements IEntityStore<T> {
  _cache = {};
  offlineStore: IOfflineStore<T>;
  onlineStore: IOnlineStore<T>;
  entityWrapCtor;
  idField;
  merger: EntityMerger;
  type: EntityTypeMeta;
  _allOfflineLoaded: Promise<void>;
  _allOnlineLoaded: Promise<any>;
  logStorage: ILogStorage<T>;
  wrapper: LazyWrapper;
  _saveDelay: 3000;

  constructor(
            typeCfg:EntityTypeCfg,
            offlineStore: IOfflineStore<T>,
            onlineStore: IOnlineStore<T>,
            logStorage?: ILogStorage<T>) {
    this.offlineStore = offlineStore;
    this.onlineStore = onlineStore;
    this.logStorage = logStorage;
    this.type = new EntityTypeMeta(typeCfg);
  }

  initialize(metaProvider: EntityMetaProvider){
    let typeName = this.type.typeName;
    metaProvider.regStore(typeName, this as any);
    this.idField = metaProvider.getIdField(typeName);
    this.entityWrapCtor = metaProvider.getEntityCtor(typeName);
    this.merger = new EntityMerger(metaProvider);
    this.wrapper = new LazyWrapper(typeName, metaProvider);
    this.offlineStore.initialize(typeName, metaProvider);
    if (this.logStorage)
      this.logStorage.initialize(typeName, metaProvider);
  }

  async loadFieldValue(entityId, field: string): Promise<T> {
    let entity = this.getOrCreate(entityId);
    if (entity.__isNew) {
      return entity.__clientValues[field];// =null, probably, otherwise we would not ask
    }
    if (entity.__serverValues && entity.__serverValues[field] != null) {
      return entity.__serverValues[field];
    }

    let sourceData = await this.onlineStore.load(entityId, [field]);
    return sourceData[field];
  }

  getOrCreate(id): Entity<T> {
    if (!id) {
      throw new Error("Null Id passed " + this.type.typeName);
    }
    let v = this._cache[id];
    if (v) {
      return v;
    }
    return this._cache[id] = new Entity<T>(this as any, id);
  }

  async saveLoadedFieldOffline(entityId, field, value): Promise<any> {
    await this.getOrCreate(entityId).saveFieldOffline(field, value);
  }

  isDirty(id) {
      let v = this._cache[id] as Entity<T>;
    if (!v) {
      return false;
    }
    (v.getValues() as any).listen();
    return v.__status !== EntityStatus.Unchanged;
  }

  merge(currentVals, newVals): any {
    return this.merger.merge(currentVals, newVals, this.type);
  }

  async loadOfflineChanges(): Promise<void> {
    let all = await this.offlineStore.getAllChanges();
    all.forEach(x => {
      let item = this.getOrCreate(x[this.idField]);
      item.importOfflineValues(x);
    });
  }

  @offlineRetry()
  async resetChanges(id): Promise<T> {

    let item = this.getOrCreate(id);
    await item.resetValues();
    return item.getValues();
  }

  @offlineRetry()
  async refreshItem(id): Promise<T> {

    let item = this.getOrCreate(id);
    await item.refreshValues();
    return item.getValues();
  }

  @offlineRetry()
  async addOrUpdate(newValues: T, o?: UpdateOptions): Promise<T> {
    if ((newValues as any).__isEntityProxy) {
      throw new Error("addOrUpdate doesn't accept proxy objects. Use plain JS objects instead.");
    }

    let isNew = o && o.isNew;
    let unfinished = o && o.isUnfinished;
    let skipServerWait = o && o.skipServerWait;

    this.log("addOrUpdate,", this.type, newValues, "unfinished", unfinished, "skipServerWait", skipServerWait);
    let id = newValues[this.idField];
    if (!id) {
      id = guid();
      isNew = true;
      newValues[this.idField] = id;
    }
    let item = this.getOrCreate(id);
    if (isNew) {
      item.__isNew = isNew;
    }
    await item.setClientValues(newValues, unfinished, !skipServerWait);
    return item.getValues();
  }

  isCreatedOffline(id) {
    let item = this.getOrCreate(id);
    return item.isCreatedOffline();
  }

  @offlineRetry()
  async queryAll(url, params?): Promise<T[]> {
    if (isOffline()) {
      return this.getAllOfflines();
    }
    if (!this._allOnlineLoaded) {
      this._allOnlineLoaded = this.query(url, params);
    }
    await this._allOnlineLoaded;
    let offlinesAndOnlines = _.values(this._cache) as Entity<T>[]; //
    let result = [];
    for (let i = 0; i < offlinesAndOnlines.length; i++) {
      let obj = offlinesAndOnlines[i].getValues();
      if (!obj) {
        await offlinesAndOnlines[i].ensureLoaded();
        obj = offlinesAndOnlines[i].getValues();
      }
      if (obj) {
        result.push(obj);
      }
    }
    if (this.type.getProp("isDeleted")) {
      result = result.filter(x => !x.isDeleted);
    }
    return result;
  }

  getVersionProp(): EntityPropMeta {
    return this.type.getProp("rowVersion");
  }


  async query(url, params?, force?): Promise<T[]> {

    let data = await this.onlineStore.query(url, params, force);
    let res = [];
    for (let i = 0; i < data.length; i++) {
      let item = this.import(data[i]);
      res.push(item);
    }
    return res;
  }

  @offlineRetry()
  import(obj: T): T {
    if (obj["vals"] && obj["setVals"]) {
      return obj;
    }

    let id = obj[this.idField];
    let item = this.getOrCreate(id);
    item.importOnlineServerValues(obj);
    return item.getValues();
  }

  async getAllOfflines(): Promise<T[]> {
    if (!this._allOfflineLoaded) {
      this._allOfflineLoaded = this.__getAllOfflines();
    }
    await this._allOfflineLoaded;
    return _.values(this._cache).map((x: Entity<T>) => {
      let values = x.getValues();
      if (values == null) {
        this.log("Found unfinished value", x.__id);
      }
      return values;
    }).filter(x => {
      return x != null;
    });
  }

  async __getAllOfflines(): Promise<void> {
    const all = await this.offlineStore.getAll();
    all.forEach(x => {
      const item = this.getOrCreate(x[this.idField]);
      item.importOfflineValues(x);
    });
  }

  getCachedOrLoad(id): T {
    if (id == null) {
      return null;
    }
    const item = this.getOrCreate(id);
    let values = item.getValues();
    if (values != null) {
      return values;
    }
    let somethingToListen = observable.box(1);
    somethingToListen.get();//listen.
    item.ensureLoaded().then(() => somethingToListen.set(2));
  }

  getCached(id): T {
    if (id == null) {
      return null;
    }
    const item = this.getOrCreate(id);
    return item.getValues();
  }

  async getItem(id, fields?: string[]): Promise<T> {
    const item = this.getOrCreate(id);
    await item.ensureLoaded(fields);
    return item.getValues();
  }

  async getChanges(onlyFinal?): Promise<T[]> {
    let all = await this.offlineStore.getAllChanges();
    if (onlyFinal) {
      all = all.filter(x => x.status === EntityStatus.EditFinished);
    }

    let arr = all.map(x => { return this.getOrCreate(x[this.idField]);});
    await foreach(all, async x => {
      let item = this.getOrCreate(x[this.idField]);
      await item.importOfflineValues(x);
    });

    return arr.map(x => x.getValues());
  }

  async pushChangesToServer(throwOnError?, p?: Progress) {
    if (throwOnError === undefined) {
      throwOnError = true;
    }
    if (!p) {
      p = new Progress();
    }

    let all = await this.offlineStore.getAllChanges();
    all = all.filter(x => x.status === EntityStatus.EditFinished);
    p.totalCount(all.length);
    this.log("Found " + all.length + " changes to push in " + this.type.typeName);
    await foreach(all, async x => {
      let item = this.getOrCreate(x[this.idField]);
      await item.importOfflineValues(x);

      await (item.pushToServer(true).then(
        () => {
          p.completeCount(1);
          this.log("Pushed " + this.type.typeName, item.__id);
        },
        err => {
          this.log("Error:Failed to push " + this.type.typeName, item.__id, err);
          p.completeCount(1);
          if (throwOnError) {
            return Promise.reject(err);
          }
        }
      ));
    });
  }

  preloadItemsArray(ids: any[]): Promise<T[]> {
    ids = ids.filter(x => x != null);
    return this.getItemsArray(ids);
  }

  async getItemsArray(ids: any[], fields?: string[]): Promise<T[]> {
    if (!ids.length) {
      return [];
    }
    let proms = [];
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let item = this.getOrCreate(id);
      proms.push(item.ensureLoaded(fields).then(() => item.getValues()));
    }
    let loadedItems = await Promise.all(proms);
    return loadedItems;
  }

  private log(...args) {
    //console.log.apply(console, arguments);
  }

  listen(entity) {
    entity.listen();
  }

}





