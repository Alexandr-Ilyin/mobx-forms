import * as  _  from "lodash";
import * as  diff  from "fast-diff";

import { Progress } from './progress';
import { observable, extras} from 'mobx';
import { lazy } from './api.common';
import { EntityStatus, EntityTypeCfg, ILogStorage, IOfflineStore, IOnlineStore, IStoreConfiguration } from '../interfaces';
import { Queue } from '../../common/queue';

export class OfflineChangesSaver {
  @observable saved = 0;
  @observable total = 0;
  saveFuncs: Array<(throwOnErr: boolean, p: Progress) => void> = [];
  q = new Queue();

  async go() {
    await this.q.enqueue(() => this._go());
  }

  async waitFinished(): Promise<any> {
    await wait(10);
    await this.q.promise;
  }

  async addSaveFunc(saveFunc: (throwOnErr: boolean, p: Progress) => void) {
    this.saveFuncs.push(saveFunc);
  }

  async _go() {
    if (isOffline()) {
      return;
    }

    let fullProgress = new Progress('full');
    fullProgress.totalCount(0);
    fullProgress.onChange(() => {
      let fullStat = fullProgress.fullStat();
      this.saved = fullStat.completeUnits;
      this.total = fullStat.fullUnits;
    });
    for (let i = 0; i < this.saveFuncs.length; i++) {
      let f = this.saveFuncs[i];
      let progress = fullProgress.child("sav_func" + i);
      progress.totalCount(0);
      await f(false, progress);
    }
  }

  get isFinished() {
    return this.saved == this.total;
  }
}

let emulateFromJs = observable(false);
let _isRealOffline = observable(false);

_isRealOffline.set(navigator.onLine === false);
window.addEventListener('online', () => _isRealOffline.set(navigator.onLine === false));
window.addEventListener('offline', () => _isRealOffline.set(navigator.onLine === false));

export function emualtedOffline() {
  if (emulateFromJs.get()) {
    return true;
  }
  return /\?offline/.test(window.location.search);
}

let send_backup = XMLHttpRequest.prototype.send;
let open_backup = XMLHttpRequest.prototype.open;
let patched = false;

export function startOfflineMonitoring() {
  if (patched) {
    return;
  }
  patched = true;

  XMLHttpRequest.prototype.send = function() {
    if (emualtedOffline()) {
      throw getOfflineError();
    }

    let __onreadystatechange = this.onreadystatechange;
    let s = this;
    this.onreadystatechange = function() {
      if (s.readyState == 4 && s.status <= 0) {
        _isRealOffline.set(true);
      }
      if (s.readyState == 4 && s.status >= 2) {
        _isRealOffline.set(false);
      }
      if (__onreadystatechange) {
        __onreadystatechange.apply(this, arguments);
      }
    };
    send_backup.apply(this, arguments);
  };
}


export function setRealOnline() {
  _isRealOffline.set(false);
}
export function isOffline() {
  return !!(_isRealOffline.get() || emualtedOffline());
}

export function setOnline(v?: boolean) {
  if (v === undefined) {
    v = true;
  }
  setOffline(!v);
}

export function setOffline(v?: boolean) {
  if (v === undefined) {
    v = true;
  }
  emulateFromJs.set(v);
  _isRealOffline.set(false);
  startOfflineMonitoring();
}

export function retryOffline<T>(func) {
  return function() {
    let self = this;
    let args = arguments;
    let x;
    try {
      x = func.apply(self, args);
    } catch (error) {
      if (isOfflineError(error)) {
        console.log("Offline retry");
        return func.apply(self, args);
      }
      else {
        throw error;
      }
    }
    if (x && x.catch && typeof(x.catch) == 'function') {
      return x.catch(err => {
        if (isOfflineError(err)) {
          _isRealOffline.set(true);
          console.log("Offline retry");
          return func.apply(self, args);
        }
        else {
          return Promise.reject(err);
        }
      })
    }
    else {
      return x;
    }
  }
}
function runOnce(func, name) {
  return function() {
    let self = this;
    let args = arguments;
    let s = '___loaded_' + name;
    if (self.hasOwnProperty(s)) {
      return self[s];
    }
    return self[s] = func.apply(self, args);
  }
}

export function once() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let wrapped = target[propertyKey];
    descriptor.value = target[propertyKey] = runOnce(wrapped, propertyKey);
  };

}

export function incLocalVersion(entity): number {
  let v = entity._getLocalVersion();
  let val = v.get() + 1;
  v.set(val);
  return val;
}

export function listenEntity(entity) {
  return entity.listen();
}

export function isNotFoundError(e) {
  e = unwrapError(e);
  if (e.exceptionType && /NotFound/i.test(e.exceptionType)) {
    return true;
  }
  return false;
}

function unwrapError(e) {
  if (e.httpResponse && e.httpResponse.data) {
    e = e.httpResponse.data;
  }
  if (e.error && e.error.response && e.error.response.body) {
    e = e.error.response.body;
  }

  if (_.isString(e) && /^\s*\{/.test(e)) {
    try {
      e = JSON.parse(e);
    } catch (err) {
    }

  }
  return e;
}

export function isConcurrencyError(e) {
  e = unwrapError(e);
  if (_.isObject(e)) {

    if (e.exceptionType && /OptimisticConcurrencyException/.test(e.exceptionType)) {
      return true;
    }

    if (e.ExceptionType && /OptimisticConcurrencyException/.test(e.ExceptionType)) {
      return true;
    }
    if (e.InnerException || e.innerException) {
      return isConcurrencyError(e.InnerException || e.innerException);
    }
  }
  return false;
}

export interface UpdateOptions {
  isNew?: boolean;
  isUnfinished?: boolean;
  skipServerWait?: boolean;
}

var _logType = null;
var _logStore = false;
var _saveDelay = 3000;
let provider = null;


export async function foreach<T>(arr: T[], func: (x: T) => Promise<any>): Promise<any> {
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    await func(item);
  }
}
export function guid() {
  // Decent solution from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  let d = Date.now();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}
export function getStrDiff(source, target) {
  let d = diff(source, target);
  let r = [];
  for (let i = 0; i < d.length; i++) {
    let dx = d[i];
    r[i] = [dx[0], dx[0] == 1 ? dx[1] : null, dx[1].length];
  }
  return r;
}

export function applyStrDiff(source, patch) {
  let si = 0;
  let parts = [];
  for (let i = 0; i < patch.length; i++) {
    let p = patch[i];
    let len = p[2];

    if (p[0] == 0) {
      parts.push(source.substr(si, len));
      si += len;
    }
    else if (p[0] == 1) {
      parts.push(p[1]);
    }
    else if (p[0] == -1) {
      si += len;
    }
  }
  return parts.join("");
}

export function wait(time): Promise<void> {
  var defer = new Defer<void>();
  setTimeout(function() {
    defer.resolve();
  }, time);
  return defer.promise();
}

export function wrapAsync<T>(p: Promise<T>): Promise<T> {
  return p;
}

export class Defer<TResult> {
  private _resolveFunc;
  private _errorFunc;
  private _promise;
  private _fail;
  private _result;
  private finished = false;

  constructor() {
    this._promise = new Promise((resolve: (result: TResult) => void, reject: (error: any) => void) => {
      this._resolveFunc = resolve;
      this._errorFunc = reject;
      this._tryFinish();
    });
  }

  private _tryFinish() {
    if (this.finished) {
      return;
    }
    if (this._result && this._resolveFunc) {
      this.finished = true;
      this._resolveFunc(this._result.result);
    }
    if (this._fail && this._errorFunc) {
      this.finished = true;
      this._errorFunc(this._fail.error);
    }
  }

  reject(error?: any) {
    this._fail = { error: error };
    this._tryFinish();
  }

  resolve(res?: TResult) {
    this._result = { result: res };
    this._tryFinish();
  }

  promise() {
    return this._promise;
  }
}
export function getOfflineError(url?) {
  let error = new Error("App is offline") as any;
  error.url = url;
  error.isOfflineError = true;
  return error;
}

export function isOfflineError(err) {
  if (err.httpResponse && err.status === 0) {
    return true;
  }
  if (err.message && /offline/i.test(err.message)) {
    return true;
  }
  if (err.isOfflineError) {
    return true;
  }
  return false;
}


export function isOnline() {
  return !isOffline();
}

export function offlineRetry() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let wrapped = target[propertyKey];
    descriptor.value = target[propertyKey] = retryOffline(wrapped);
  };
}


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

    if (this.__serverValues!=null && newValues!=null) {
      let versionProp = this.__store.getVersionProp();
      if (versionProp!=null){
        if (this.__serverValues[versionProp.name]==newValues[versionProp.name]) {
          return false;
        }
      }
    }
    this.__serverValues = newValues;
    return true;
  }

  importOnlineServerValues(newValues: T) {
    this.log("__importOnlineServerValues");
    let maybeOfflineHasUsefulLazies = this.__serverValues==null;

    if (!this.__setServerValuesIfExpired(newValues))
      return;
    this.__isNew = false;
    this.__loadedOnlineVersion = true;
    this.__updateClientValues();
    if (maybeOfflineHasUsefulLazies)
      this.__queue.enqueue(() => this.__saveImportedValueOffline());
    else
      this.__queue.enqueue(() => this.__saveOffline());
  }

  isCreatedOffline() {
    return this.__isNew;
  }

  private async __saveImportedValueOffline(){

    let offline = await this.__store.offlineStore.find(this.__id);
    if (offline!=null) {
      if (this.__serverValues!=null && offline.serverValues!=null) {
        let versionProp = this.__store.getVersionProp();
        if (versionProp!=null){
          if (this.__serverValues[versionProp.name]==offline.serverValues[versionProp.name]) {
            this.__serverValues=offline.serverValues;
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
      if (offline)
        this.__importOfflineValues(offline);
      if (!this.__serverValues)
        throw getOfflineError();
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
      let alreadyLoaded = await this._ensureLazyLoaded(fields);
      await this.__saveOffline();
    }
    else {
      let alreadyLoaded = await this._ensureLazyLoaded(fields);
      if (!alreadyLoaded)
        await this.__saveOffline();
    }
  }

  private __canGetValues(): boolean {
    if (this.__isNew) {
      return true;
    }
    if (this.__loadedOnlineVersion || this.__loadedOfflineChanges) {
      return true;
    }
    return false;
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
    if (off.status == EntityStatus.EditFinished || off.status == EntityStatus.EditUnfinished)
      if (this.__store.logStorage)
        this.__store.logStorage.writeLog(this.__id, this.__getClientValues());
  }

  private async __pushToServer(waitServerSave: boolean, saveDelay?) {
    if (!this.__store.offlineStore.isPersistent())
      waitServerSave = true;
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
        saveDelay = _saveDelay;
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
    if (!_logStore)
      return;
    if (_logType!=null && this.__store.type.typeName!=_logType)
      return;
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

  private _isLoaded(fields?: string[]) {
    if (!this.__serverValues)
      return false;

    if (!fields)
      return true;

    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let v = LazyHelper.unwrap(this.__serverValues[f]);
      if (v === null || v === undefined)
        return false;
    }
    return true;
  }

  private async _ensureLazyLoaded(fields?: string[]): Promise<boolean> {
    if (!fields)
      return true;
    if (fields.length == 1 && fields[0] == ".")
      return true;
    let wrapper = this.____getOrCreateWrapper();
    let waits = [];
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let lazy = wrapper[f] as LazyValue<any>;
      if (lazy && lazy.getCached) {
        if (lazy.getCached())
          continue;
        else {
          waits.push(lazy.get());
        }
      }
    }
    await Promise.all(waits);
    return waits.length > 0;
  }
}

export function applyJsonDiff(source, diff) {
  if (diff === undefined) {
    return source;
  }

  if (diff == null) {
    return null;
  }
  if (source == null) {
    return diff;
  }
  if (typeof(source) == "string" && diff.__s) {
    return applyStrDiff(source, diff.__s);
  }

  if (typeof(source) == "object" && typeof(diff) == "object") {
    let copy = _.clone(source);
    let clean = false;
    for (let t in diff) {
      if (!diff.hasOwnProperty(t)) {
        continue;
      }
      let n = diff[t];
      let o = source[t];
      let newV = applyJsonDiff(o, n);
      copy[t] = newV;

      if (n && n.__r) {
        if (!_.isArray(copy)) {
          delete copy[t];
        }
        else {
          clean = true;
          copy[t] = n;
        }
      }

    }
    if (clean) {
      copy = (copy as any[]).filter(x => !x || !x.__r);
    }

    return copy;
  }
  if (diff && diff.__r) {
    return null;
  }
  return diff;
}

export class LazyWrapper implements ILazyWrapper {
  lazyfieldNames: string[];
  lazyfieldNamesJson;
  provider : EntityMetaProvider;
  private typeName: any;

  constructor(typeName,provider : EntityMetaProvider) {
    this.typeName = typeName;
    this.provider = provider;

  }

  wrapLazyFields<T>(t: T): T {
    if (!t)
      return t;
    let res: any = {};
    let type = this.provider.getType(this.typeName);
    type.props.forEach(x => {
      let v = t[x.name];
      if (v === undefined)
        return;
      if (x.isLazy)
        res[x.name] = LazyHelper.wrap(v);
      else
        res[x.name] = v;
    });
    return res;
  }

  unwrapLazyFields<T>(t: T): T {
    if (!t)
      return t;
    let res: any = {};
    let type = this.provider.getType(this.typeName);
    type.props.forEach(x => {
      let v = t[x.name];
      if (v === undefined)
        return;
      if (x.isLazy)
        res[x.name] = LazyHelper.unwrap(v);
      else
        res[x.name] = v;
    });
    return res;
  }

  getLazyFieldNamesJson(): any {
    if (this.lazyfieldNamesJson == null) {
      this.lazyfieldNamesJson = {};
      for (let i = 0; i < this.getLazyFieldNames().length; i++) {
        let name = this.getLazyFieldNames()[i];
        this.lazyfieldNamesJson[name] = true;
      }
    }
    return this.lazyfieldNamesJson;
  }

  getLazyFieldNames(): string[] {
    if (this.lazyfieldNames == null) {
      let type = this.provider.getType(this.typeName);
      this.lazyfieldNames = type.props.filter(x => x.isLazy).map(x => x.name);
    }
    return this.lazyfieldNames;
  }
}
export function toDict<T>(arr: T[], f: (t: T) => any): { [key: string]: T } {
  let hashSet = {};
  for (let i = 0; i < arr.length; i++) {
    let obj = arr[i];
    hashSet[f(obj)] = obj;
  }
  return hashSet;
}

export interface ILazyWrapper {
  wrapLazyFields<T>(t: T):T
  unwrapLazyFields<T>(t: T):T;
  getLazyFieldNames():string[]
}

export interface LogEntry<T> {
  id?;
  entityId;
  timeStamp;
  parentLogId?;
  diff?: any;
  value?: T;
  selected?: boolean;
}

export class EntityLog<T> {
  private logDic: { [p: string]: LogEntry<any> };
  private logs: LogEntry<T>[];
  wrapper :ILazyWrapper;

  constructor(logs: LogEntry<T>[], wrapper :ILazyWrapper) {
    this.logs = logs;
    this.logDic = toDict(logs, x => x.id);
    this.wrapper = wrapper;
  }

  getItems(): LogEntry<T>[] {
    return this.logs;
  }

  getMergedVersion(logId, recCheck?): T {
    let t = this._getMergedVersion(logId, recCheck);
    let wrapped = this.wrapper.wrapLazyFields(t);
    return wrapped;
  }

  _getMergedVersion(logId, recCheck?): T {
    if (!recCheck) {
      recCheck = 1;
    }
    if (recCheck > 1000) {
      throw new Error("Too deep recursion");
    }

    let e = this.logDic[logId];
    if (!e) {
      return null;
    }
    if (e.value) {
      return e.value;
    }

    if (e.parentLogId) {
      let prev = this._getMergedVersion(e.parentLogId, recCheck + 1);
      if (!prev) {
        return null;
      }
      let result = applyJsonDiff(prev, e.diff);
      return result;
    }
    return null;
  }
}



export interface LazyValue<T> {
  get(): Promise<T>
  getCached(loadIfMissing?: boolean, defaultValue?): T
}

export interface IReferenceStore<T> {
  getCached(refVal): T;

  getItem(refVal, fields?: string[]): Promise<T>;

  loadFieldValue(entityId, field: string): Promise<T>;

  saveLoadedFieldOffline(entityId, field: string, value): Promise<any>;
}


export class OfflineDataItem<T> {
  id: string;
  serverValues: T;
  clientValues: T;
  status: EntityStatus;
  isNew: any;
}


export class EntityStore<T> implements IReferenceStore<T> {
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

  constructor(offlineStore: IOfflineStore<T>, onlineStore: IOnlineStore<T>,
              metaProvider: EntityMetaProvider, typeName, logStorage: ILogStorage<T>) {
    this.offlineStore = offlineStore;
    this.onlineStore = onlineStore;
    this.logStorage = logStorage;

    metaProvider.regStore(typeName, this as any);
    this.idField = metaProvider.getIdField(typeName);
    let entityCtor = metaProvider.getEntityCtor(typeName);
    this.entityWrapCtor = entityCtor;
    this.merger = new EntityMerger(metaProvider);
    this.type = metaProvider.getType(typeName);
    this.wrapper = new LazyWrapper(typeName, metaProvider);
  }

  async loadFieldValue(entityId, field: string): Promise<T> {
    let entity = this.getOrCreate(entityId);
    if (entity.__isNew) {
      return entity.__clientValues[field];// =null, probably, otherwise we would not ask
    }
    if (entity.__serverValues && entity.__serverValues[field]!=null)
      return entity.__serverValues[field];

    let sourceData = await this.onlineStore.load(entityId, [field]);
    let value = sourceData[field];
    return value;
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
    listenEntity(v.getValues());
    let res = v.__status !== EntityStatus.Unchanged;
    return res;
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
    if ((newValues as any) .__isEntityProxy) {
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
    let res = item.getValues();

    return res;
  }

  isCreatedOffline(id) {
    let item = this.getOrCreate(id);
    return item.isCreatedOffline();
  }

  @offlineRetry()
  async queryAll(url, params?): Promise<T[]> {
    if (isOffline()){
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
      if (obj)
        result.push(obj);
    }
    if (this.type.getProp("isDeleted"))
      result = result.filter(x => !x.isDeleted);
    return result;
  }

  getVersionProp() : EntityPropMeta {
    return this.type.getProp("rowVersion");
  }

  async queryFields(url, fields: T): Promise<T[]> {
    return this.query(url, {fields: _.keys(fields).join(",")});
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
    let r = item.importOnlineServerValues(obj);
    return item.getValues();
  }

  async getAllOfflines(): Promise<T[]> {
    if (!this._allOfflineLoaded) {
      this._allOfflineLoaded = this.__getAllOfflines();
    }
    await this._allOfflineLoaded;
    let v = _.values(this._cache).map((x: Entity<T>) => {
      let values = x.getValues();
      if (values == null) {
        this.log("Found unfinished value", x.__id);
      }
      return values;
    }).filter(x => {
      return x != null;
    });
    return v;
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
    if (values !=null)
      return values;
    let somethingToListen = observable.box(1);
    somethingToListen.get();//listen.
    item.ensureLoaded().then(()=>somethingToListen.set(2));
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
}

export class EntityMerger {
  private metaProvider: EntityMetaProvider;

  constructor(metaProvider: EntityMetaProvider) {
    this.metaProvider = metaProvider;
  }

  merge(oldVals, newVals, type: EntityTypeMeta): any {
    let current = _.cloneDeep(oldVals);
    this.__merge(current, newVals, type);
    return current;
  }

  private __merge(current, newVals, type: EntityTypeMeta): any {
    if (!newVals) {
      throw new Error("Object expected");
    }

    for (let k in newVals) {
      if (!newVals.hasOwnProperty(k) || typeof(newVals[k]) === 'function') {
        continue;
      }

      let p = type.getProp(k);
      if (!p || p.isSimple()) {
        current[k] = newVals[k];
      } else if (p.isNested) {
        if (!current[k]) {
          current[k] = {};
        }
        this.__merge(current[k], newVals[k], this.metaProvider.getType(p.nestedTypeName));
      } else if (p.isNestedCollection) {
        if (!current[k]) {
          current[k] = [];
        }

        let currentArr = current[k];
        let newArr = newVals[k];

        let itemType: EntityTypeMeta = this.metaProvider.getType(p.nestedCollTypeName);
        let itemKeyGetter = this.metaProvider.tryGetKeyGetter(itemType);
        if (itemKeyGetter == null) {
          current[p.name] = newArr;
        }

        let cd = toDict(currentArr, x => (itemKeyGetter(x) || guid()));
        let nd = toDict(newArr, x => (itemKeyGetter(x) || guid()));

        let updatedValue = [];
        for (let key in nd) {
          let newItem = nd[key];
          let oldItem = cd[key] || {};
          this.__merge(oldItem, newItem, itemType);
          updatedValue.push(oldItem);
        }
        current[p.name] = updatedValue;
      }
    }
    return current;
  }
}


export class EntityMetaProvider {
  private metas: {};
  stores = {};
  private ctors = {};
  private lazyCtors = {};

  constructor(metas: EntityTypeMeta[]) {
    this.metas = metas.reduce((x, v) => {
      x[v.typeName] = v;
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

  regStore<T>(typeName, store: IReferenceStore<T>) {
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

      let store = self.stores[rootType] as IReferenceStore<any>;

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
          let v = LazyHelper.unwrap(vals[prop.name]);

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
        let loadedVal = LazyHelper.unwrap(vals[prop.name]);
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
            this.wraps[prop.name] = LazyHelper.wrap(array);
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

    ctor.prototype.update = function (json) {
      meta.props.forEach(p => {
        if (p.isKey)
          json[p.name] = this[p.name];
      });
      let store = self.stores[typeName] as EntityStore<any>;
      return store.addOrUpdate(json);
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

          let store = self.stores[prop.referenceTypeName] as IReferenceStore<any>;
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


export class LazyHelper {
  static wrap<T>(t: T): LazyValue<T> {
    return {
      getCached() {
        return t;
      },
      get(): Promise<T> {
        return Promise.resolve(t);
      }
    };
  }

  static unwrap<T>(serverValue): T {
    if (!serverValue)
      return serverValue;
    if (serverValue.getCached)
      return serverValue.getCached();
    return serverValue;
  }
}

