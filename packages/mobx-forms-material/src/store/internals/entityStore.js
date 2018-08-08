"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a, _b, _c;
const _ = require("lodash");
const diff = require("fast-diff");
const progress_1 = require("./progress");
const mobx_1 = require("mobx");
const api_common_1 = require("./api.common");
const interfaces_1 = require("../interfaces");
const queue_1 = require("../../common/queue");
class OfflineChangesSaver {
    constructor() {
        this.saved = 0;
        this.total = 0;
        this.saveFuncs = [];
        this.q = new queue_1.Queue();
    }
    go() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.q.enqueue(() => this._go());
        });
    }
    waitFinished() {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait(10);
            yield this.q.promise;
        });
    }
    addSaveFunc(saveFunc) {
        return __awaiter(this, void 0, void 0, function* () {
            this.saveFuncs.push(saveFunc);
        });
    }
    _go() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOffline()) {
                return;
            }
            let fullProgress = new progress_1.Progress('full');
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
                yield f(false, progress);
            }
        });
    }
    get isFinished() {
        return this.saved == this.total;
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], OfflineChangesSaver.prototype, "saved", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], OfflineChangesSaver.prototype, "total", void 0);
exports.OfflineChangesSaver = OfflineChangesSaver;
let emulateFromJs = mobx_1.observable(false);
let _isRealOffline = mobx_1.observable(false);
_isRealOffline.set(navigator.onLine === false);
window.addEventListener('online', () => _isRealOffline.set(navigator.onLine === false));
window.addEventListener('offline', () => _isRealOffline.set(navigator.onLine === false));
function emualtedOffline() {
    if (emulateFromJs.get()) {
        return true;
    }
    return /\?offline/.test(window.location.search);
}
exports.emualtedOffline = emualtedOffline;
let send_backup = XMLHttpRequest.prototype.send;
let open_backup = XMLHttpRequest.prototype.open;
let patched = false;
function startOfflineMonitoring() {
    if (patched) {
        return;
    }
    patched = true;
    XMLHttpRequest.prototype.send = function () {
        if (emualtedOffline()) {
            throw getOfflineError();
        }
        let __onreadystatechange = this.onreadystatechange;
        let s = this;
        this.onreadystatechange = function () {
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
exports.startOfflineMonitoring = startOfflineMonitoring;
function setRealOnline() {
    _isRealOffline.set(false);
}
exports.setRealOnline = setRealOnline;
function isOffline() {
    return !!(_isRealOffline.get() || emualtedOffline());
}
exports.isOffline = isOffline;
function setOnline(v) {
    if (v === undefined) {
        v = true;
    }
    setOffline(!v);
}
exports.setOnline = setOnline;
function setOffline(v) {
    if (v === undefined) {
        v = true;
    }
    emulateFromJs.set(v);
    _isRealOffline.set(false);
    startOfflineMonitoring();
}
exports.setOffline = setOffline;
function retryOffline(func) {
    return function () {
        let self = this;
        let args = arguments;
        let x;
        try {
            x = func.apply(self, args);
        }
        catch (error) {
            if (isOfflineError(error)) {
                console.log("Offline retry");
                return func.apply(self, args);
            }
            else {
                throw error;
            }
        }
        if (x && x.catch && typeof (x.catch) == 'function') {
            return x.catch(err => {
                if (isOfflineError(err)) {
                    _isRealOffline.set(true);
                    console.log("Offline retry");
                    return func.apply(self, args);
                }
                else {
                    return Promise.reject(err);
                }
            });
        }
        else {
            return x;
        }
    };
}
exports.retryOffline = retryOffline;
function runOnce(func, name) {
    return function () {
        let self = this;
        let args = arguments;
        let s = '___loaded_' + name;
        if (self.hasOwnProperty(s)) {
            return self[s];
        }
        return self[s] = func.apply(self, args);
    };
}
function once() {
    return function (target, propertyKey, descriptor) {
        let wrapped = target[propertyKey];
        descriptor.value = target[propertyKey] = runOnce(wrapped, propertyKey);
    };
}
exports.once = once;
function incLocalVersion(entity) {
    let v = entity._getLocalVersion();
    let val = v.get() + 1;
    v.set(val);
    return val;
}
exports.incLocalVersion = incLocalVersion;
function listenEntity(entity) {
    return entity.listen();
}
exports.listenEntity = listenEntity;
function isNotFoundError(e) {
    e = unwrapError(e);
    if (e.exceptionType && /NotFound/i.test(e.exceptionType)) {
        return true;
    }
    return false;
}
exports.isNotFoundError = isNotFoundError;
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
        }
        catch (err) {
        }
    }
    return e;
}
function isConcurrencyError(e) {
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
exports.isConcurrencyError = isConcurrencyError;
var _logType = null;
var _logStore = false;
var _saveDelay = 3000;
let provider = null;
function foreach(arr, func) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            yield func(item);
        }
    });
}
exports.foreach = foreach;
function guid() {
    let d = Date.now();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}
exports.guid = guid;
function getStrDiff(source, target) {
    let d = diff(source, target);
    let r = [];
    for (let i = 0; i < d.length; i++) {
        let dx = d[i];
        r[i] = [dx[0], dx[0] == 1 ? dx[1] : null, dx[1].length];
    }
    return r;
}
exports.getStrDiff = getStrDiff;
function applyStrDiff(source, patch) {
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
exports.applyStrDiff = applyStrDiff;
function wait(time) {
    var defer = new Defer();
    setTimeout(function () {
        defer.resolve();
    }, time);
    return defer.promise();
}
exports.wait = wait;
function wrapAsync(p) {
    return p;
}
exports.wrapAsync = wrapAsync;
class Defer {
    constructor() {
        this.finished = false;
        this._promise = new Promise((resolve, reject) => {
            this._resolveFunc = resolve;
            this._errorFunc = reject;
            this._tryFinish();
        });
    }
    _tryFinish() {
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
    reject(error) {
        this._fail = { error: error };
        this._tryFinish();
    }
    resolve(res) {
        this._result = { result: res };
        this._tryFinish();
    }
    promise() {
        return this._promise;
    }
}
exports.Defer = Defer;
function getOfflineError(url) {
    let error = new Error("App is offline");
    error.url = url;
    error.isOfflineError = true;
    return error;
}
exports.getOfflineError = getOfflineError;
function isOfflineError(err) {
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
exports.isOfflineError = isOfflineError;
function isOnline() {
    return !isOffline();
}
exports.isOnline = isOnline;
function offlineRetry() {
    return function (target, propertyKey, descriptor) {
        let wrapped = target[propertyKey];
        descriptor.value = target[propertyKey] = retryOffline(wrapped);
    };
}
exports.offlineRetry = offlineRetry;
class Entity {
    constructor(store, _id) {
        this.__version = 0;
        this.__status = interfaces_1.EntityStatus.Unchanged;
        this.__queue = new queue_1.Queue();
        this.__valuesWrapper = null;
        this.__store = store;
        this.__id = _id;
    }
    get saveQueue() {
        if (!this.__saveQueue) {
            this.__saveQueue = new queue_1.Queue();
        }
        return this.__saveQueue;
    }
    pushToServer(waitServerSave) {
        this.log("pushToServer");
        return this.__queue.enqueue(() => this.__pushToServer(waitServerSave));
    }
    setClientValues(newValues, final, waitServer) {
        this.log("setChangedValues");
        return this.__queue.enqueue(() => this.__setClientValues(newValues, final, waitServer));
    }
    saveFieldOffline(field, value) {
        return this.__queue.enqueue(() => this.__saveFieldOffline(field, value));
    }
    resetValues() {
        this.log("resetValues");
        return this.__queue.enqueue(() => this.__resetValues());
    }
    refreshValues() {
        this.log("refreshValues");
        return this.__queue.enqueue(() => this.__refreshValues());
    }
    ensureLoaded(fields) {
        this.log("ensureLoaded");
        return this.__queue.enqueue(() => this.__ensureLoaded(fields));
    }
    getValues() {
        this.log("getValues");
        return this.__getValues();
    }
    importOfflineValues(newValues) {
        this.log("importOfflineValues");
        if (this.__loadedOfflineChanges) {
            this.log("importOfflineValues - skip");
            return;
        }
        this.__importOfflineValues(newValues);
        this.__updateClientValues();
        this.__loadedOfflineChanges = true;
    }
    __setServerValuesIfExpired(newValues) {
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
    importOnlineServerValues(newValues) {
        this.log("__importOnlineServerValues");
        let maybeOfflineHasUsefulLazies = this.__serverValues == null;
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
    __saveImportedValueOffline() {
        return __awaiter(this, void 0, void 0, function* () {
            let offline = yield this.__store.offlineStore.find(this.__id);
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
            yield this.__saveOffline();
            return;
        });
    }
    __importOfflineValues(v) {
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
        if (this.__status === interfaces_1.EntityStatus.Unchanged) {
            this.__status = v.status;
        }
        this.__isNew = v.isNew;
    }
    __ensureLoaded(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("__ensureLoaded");
            if (this.__isNew) {
                return;
            }
            if (isOffline()) {
                let offline = yield this.__store.offlineStore.find(this.__id);
                if (offline)
                    this.__importOfflineValues(offline);
                if (!this.__serverValues)
                    throw getOfflineError();
                return;
            }
            if (!this.__loadedOnlineVersion) {
                this.log("Will load online ");
                let onlineVersion = yield this.__store.onlineStore.load(this.__id, fields);
                this.__setServerValuesIfExpired(onlineVersion);
                if (onlineVersion == null && this.__serverValues == null) {
                    this.logError("Missing object ", this.__store.type.typeName, this.__id);
                }
                this.__loadedOnlineVersion = true;
                let alreadyLoaded = yield this._ensureLazyLoaded(fields);
                yield this.__saveOffline();
            }
            else {
                let alreadyLoaded = yield this._ensureLazyLoaded(fields);
                if (!alreadyLoaded)
                    yield this.__saveOffline();
            }
        });
    }
    __canGetValues() {
        if (this.__isNew) {
            return true;
        }
        if (this.__loadedOnlineVersion || this.__loadedOfflineChanges) {
            return true;
        }
        return false;
    }
    __getValues() {
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
        }
        else if (!this.__clientValues) {
            merged = this.__serverValues;
        }
        else {
            merged = this.__store.merge(this.__serverValues, this.__clientValues);
        }
        return merged;
    }
    __saveFieldOffline(field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.__serverValues) {
                this.logError("Sever values are supposed to be loaded before lazies!");
                return;
            }
            this.__serverValues[field] = value;
            this.__updateClientValues();
            yield this.__saveOffline();
        });
    }
    __saveOffline() {
        return __awaiter(this, void 0, void 0, function* () {
            let off = {
                id: this.__id,
                serverValues: this.__serverValues,
                clientValues: this.__clientValues,
                status: this.__status,
                isNew: this.__isNew
            };
            this.log("__saveOffline", off);
            yield this.__store.offlineStore.set(this.__id, off);
            if (off.status == interfaces_1.EntityStatus.EditFinished || off.status == interfaces_1.EntityStatus.EditUnfinished)
                if (this.__store.logStorage)
                    this.__store.logStorage.writeLog(this.__id, this.__getClientValues());
        });
    }
    __pushToServer(waitServerSave, saveDelay) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.__store.offlineStore.isPersistent())
                waitServerSave = true;
            this.log("__pushToServer..wait:", waitServerSave);
            yield this.__ensureLoaded();
            if (this.__status !== interfaces_1.EntityStatus.EditFinished) {
                return;
            }
            if (!this.__clientValues) {
                return;
            }
            let _version = this.__version;
            if (saveDelay == null) {
                if (!waitServerSave) {
                    saveDelay = _saveDelay;
                }
                else {
                    saveDelay = 0;
                }
            }
            let savePromise = wait(saveDelay).then(() => {
                return this.saveQueue.enqueue((() => __awaiter(this, void 0, void 0, function* () {
                    if (_version !== this.__version) {
                        return;
                    }
                    this.__version++;
                    _version = this.__version;
                    let pushedVersion;
                    if (!this.__serverValues) {
                        pushedVersion = this.__clientValues;
                    }
                    else {
                        pushedVersion = this.__store.merge(this.__serverValues, this.__clientValues);
                    }
                    this.log("Will push ", pushedVersion);
                    let onlineVersion = yield this.__store.onlineStore.save(this.__id, pushedVersion, this.__clientValues);
                    this.__setServerValuesIfExpired(onlineVersion);
                    this.log("Server values=", this.__serverValues);
                    this.log("Received server values", onlineVersion);
                    if (_version !== this.__version) {
                        return;
                    }
                    this.__clientValues = null;
                    this.__status = interfaces_1.EntityStatus.Unchanged;
                    this.__loadedOnlineVersion = true;
                    this.__isNew = false;
                    this.__updateClientValues();
                    yield this.__saveOffline();
                })));
            });
            savePromise = wrapAsync(savePromise);
            if (waitServerSave) {
                yield savePromise;
            }
            else {
                this.log("Server wait skip");
            }
        });
    }
    logError(a1, a2, a3) {
        if (a3) {
            console.log(this.__store.type, this.__id, a1, a2, a3);
        }
        else if (a2) {
            console.log(this.__store.type, this.__id, a1, a2);
        }
        else {
            console.log(this.__store.type, this.__id, a1);
        }
    }
    log(...args) {
        if (!_logStore)
            return;
        if (_logType != null && this.__store.type.typeName != _logType)
            return;
        console.log(this.__store.type.typeName, this.__id, ...args);
    }
    __setClientValues(newValues, unfinished, waitServer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("__setChangedValues", newValues);
            yield this.__ensureLoaded();
            newValues = this.__store.wrapper.unwrapLazyFields(newValues);
            let newClientValues = null;
            if (!this.__clientValues) {
                newClientValues = newValues;
            }
            else {
                newClientValues = this.__store.merge(this.__clientValues, newValues);
            }
            this.__clientValues = newClientValues;
            this.__version++;
            if (unfinished) {
                this.__status = interfaces_1.EntityStatus.EditUnfinished;
            }
            else {
                this.__status = interfaces_1.EntityStatus.EditFinished;
            }
            this.__updateClientValues();
            yield this.__saveOffline();
            if (!unfinished && isOnline()) {
                yield this.__pushToServer(waitServer);
            }
            this.log("__setChangedValues-finished", newValues);
        });
    }
    __refreshValues() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("__reset");
            yield this.__ensureLoaded();
            if (this.__isNew) {
                return;
            }
            if (!isOnline() || this.__clientValues) {
                return;
            }
            let newVals = yield this.__store.onlineStore.load(this.__id, ["."]);
            let changed = this.__setServerValuesIfExpired(newVals);
            this.__status = interfaces_1.EntityStatus.Unchanged;
            if (changed) {
                yield this.__saveOffline();
                this.__updateClientValues();
            }
        });
    }
    __resetValues() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("__reset");
            yield this.__ensureLoaded();
            if (this.__isNew) {
                return;
            }
            if (isOnline()) {
                this.log("__reset - go online");
                let serverValues = yield this.__store.onlineStore.load(this.__id, ["."]);
                this.__setServerValuesIfExpired(serverValues);
                this.log("__reset - got", this.__serverValues);
            }
            this.__clientValues = null;
            this.__status = interfaces_1.EntityStatus.Unchanged;
            yield this.__saveOffline();
            this.__updateClientValues();
        });
    }
    _isLoaded(fields) {
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
    _ensureLazyLoaded(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fields)
                return true;
            if (fields.length == 1 && fields[0] == ".")
                return true;
            let wrapper = this.____getOrCreateWrapper();
            let waits = [];
            for (let i = 0; i < fields.length; i++) {
                let f = fields[i];
                let lazy = wrapper[f];
                if (lazy && lazy.getCached) {
                    if (lazy.getCached())
                        continue;
                    else {
                        waits.push(lazy.get());
                    }
                }
            }
            yield Promise.all(waits);
            return waits.length > 0;
        });
    }
}
exports.Entity = Entity;
function applyJsonDiff(source, diff) {
    if (diff === undefined) {
        return source;
    }
    if (diff == null) {
        return null;
    }
    if (source == null) {
        return diff;
    }
    if (typeof (source) == "string" && diff.__s) {
        return applyStrDiff(source, diff.__s);
    }
    if (typeof (source) == "object" && typeof (diff) == "object") {
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
            copy = copy.filter(x => !x || !x.__r);
        }
        return copy;
    }
    if (diff && diff.__r) {
        return null;
    }
    return diff;
}
exports.applyJsonDiff = applyJsonDiff;
class LazyWrapper {
    constructor(typeName, provider) {
        this.typeName = typeName;
        this.provider = provider;
    }
    wrapLazyFields(t) {
        if (!t)
            return t;
        let res = {};
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
    unwrapLazyFields(t) {
        if (!t)
            return t;
        let res = {};
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
    getLazyFieldNamesJson() {
        if (this.lazyfieldNamesJson == null) {
            this.lazyfieldNamesJson = {};
            for (let i = 0; i < this.getLazyFieldNames().length; i++) {
                let name = this.getLazyFieldNames()[i];
                this.lazyfieldNamesJson[name] = true;
            }
        }
        return this.lazyfieldNamesJson;
    }
    getLazyFieldNames() {
        if (this.lazyfieldNames == null) {
            let type = this.provider.getType(this.typeName);
            this.lazyfieldNames = type.props.filter(x => x.isLazy).map(x => x.name);
        }
        return this.lazyfieldNames;
    }
}
exports.LazyWrapper = LazyWrapper;
function toDict(arr, f) {
    let hashSet = {};
    for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        hashSet[f(obj)] = obj;
    }
    return hashSet;
}
exports.toDict = toDict;
class EntityLog {
    constructor(logs, wrapper) {
        this.logs = logs;
        this.logDic = toDict(logs, x => x.id);
        this.wrapper = wrapper;
    }
    getItems() {
        return this.logs;
    }
    getMergedVersion(logId, recCheck) {
        let t = this._getMergedVersion(logId, recCheck);
        let wrapped = this.wrapper.wrapLazyFields(t);
        return wrapped;
    }
    _getMergedVersion(logId, recCheck) {
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
exports.EntityLog = EntityLog;
class OfflineDataItem {
}
exports.OfflineDataItem = OfflineDataItem;
class EntityStore {
    constructor(offlineStore, onlineStore, metaProvider, typeName, logStorage) {
        this._cache = {};
        this.offlineStore = offlineStore;
        this.onlineStore = onlineStore;
        this.logStorage = logStorage;
        metaProvider.regStore(typeName, this);
        this.idField = metaProvider.getIdField(typeName);
        let entityCtor = metaProvider.getEntityCtor(typeName);
        this.entityWrapCtor = entityCtor;
        this.merger = new EntityMerger(metaProvider);
        this.type = metaProvider.getType(typeName);
        this.wrapper = new LazyWrapper(typeName, metaProvider);
    }
    loadFieldValue(entityId, field) {
        return __awaiter(this, void 0, void 0, function* () {
            let entity = this.getOrCreate(entityId);
            if (entity.__isNew) {
                return entity.__clientValues[field];
            }
            if (entity.__serverValues && entity.__serverValues[field] != null)
                return entity.__serverValues[field];
            let sourceData = yield this.onlineStore.load(entityId, [field]);
            let value = sourceData[field];
            return value;
        });
    }
    getOrCreate(id) {
        if (!id) {
            throw new Error("Null Id passed " + this.type.typeName);
        }
        let v = this._cache[id];
        if (v) {
            return v;
        }
        return this._cache[id] = new Entity(this, id);
    }
    saveLoadedFieldOffline(entityId, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getOrCreate(entityId).saveFieldOffline(field, value);
        });
    }
    isDirty(id) {
        let v = this._cache[id];
        if (!v) {
            return false;
        }
        listenEntity(v.getValues());
        let res = v.__status !== interfaces_1.EntityStatus.Unchanged;
        return res;
    }
    merge(currentVals, newVals) {
        return this.merger.merge(currentVals, newVals, this.type);
    }
    loadOfflineChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            let all = yield this.offlineStore.getAllChanges();
            all.forEach(x => {
                let item = this.getOrCreate(x[this.idField]);
                item.importOfflineValues(x);
            });
        });
    }
    resetChanges(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.getOrCreate(id);
            yield item.resetValues();
            return item.getValues();
        });
    }
    refreshItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let item = this.getOrCreate(id);
            yield item.refreshValues();
            return item.getValues();
        });
    }
    addOrUpdate(newValues, o) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newValues.__isEntityProxy) {
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
            yield item.setClientValues(newValues, unfinished, !skipServerWait);
            let res = item.getValues();
            return res;
        });
    }
    isCreatedOffline(id) {
        let item = this.getOrCreate(id);
        return item.isCreatedOffline();
    }
    queryAll(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOffline()) {
                return this.getAllOfflines();
            }
            if (!this._allOnlineLoaded) {
                this._allOnlineLoaded = this.query(url, params);
            }
            yield this._allOnlineLoaded;
            let offlinesAndOnlines = _.values(this._cache);
            let result = [];
            for (let i = 0; i < offlinesAndOnlines.length; i++) {
                let obj = offlinesAndOnlines[i].getValues();
                if (!obj) {
                    yield offlinesAndOnlines[i].ensureLoaded();
                    obj = offlinesAndOnlines[i].getValues();
                }
                if (obj)
                    result.push(obj);
            }
            if (this.type.getProp("isDeleted"))
                result = result.filter(x => !x.isDeleted);
            return result;
        });
    }
    getVersionProp() {
        return this.type.getProp("rowVersion");
    }
    queryFields(url, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query(url, { fields: _.keys(fields).join(",") });
        });
    }
    query(url, params, force) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.onlineStore.query(url, params, force);
            let res = [];
            for (let i = 0; i < data.length; i++) {
                let item = this.import(data[i]);
                res.push(item);
            }
            return res;
        });
    }
    import(obj) {
        if (obj["vals"] && obj["setVals"]) {
            return obj;
        }
        let id = obj[this.idField];
        let item = this.getOrCreate(id);
        let r = item.importOnlineServerValues(obj);
        return item.getValues();
    }
    getAllOfflines() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._allOfflineLoaded) {
                this._allOfflineLoaded = this.__getAllOfflines();
            }
            yield this._allOfflineLoaded;
            let v = _.values(this._cache).map((x) => {
                let values = x.getValues();
                if (values == null) {
                    this.log("Found unfinished value", x.__id);
                }
                return values;
            }).filter(x => {
                return x != null;
            });
            return v;
        });
    }
    __getAllOfflines() {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield this.offlineStore.getAll();
            all.forEach(x => {
                const item = this.getOrCreate(x[this.idField]);
                item.importOfflineValues(x);
            });
        });
    }
    getCachedOrLoad(id) {
        if (id == null) {
            return null;
        }
        const item = this.getOrCreate(id);
        let values = item.getValues();
        if (values != null)
            return values;
        let somethingToListen = mobx_1.observable.box(1);
        somethingToListen.get();
        item.ensureLoaded().then(() => somethingToListen.set(2));
    }
    getCached(id) {
        if (id == null) {
            return null;
        }
        const item = this.getOrCreate(id);
        return item.getValues();
    }
    getItem(id, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getOrCreate(id);
            yield item.ensureLoaded(fields);
            return item.getValues();
        });
    }
    getChanges(onlyFinal) {
        return __awaiter(this, void 0, void 0, function* () {
            let all = yield this.offlineStore.getAllChanges();
            if (onlyFinal) {
                all = all.filter(x => x.status === interfaces_1.EntityStatus.EditFinished);
            }
            let arr = all.map(x => { return this.getOrCreate(x[this.idField]); });
            yield foreach(all, (x) => __awaiter(this, void 0, void 0, function* () {
                let item = this.getOrCreate(x[this.idField]);
                yield item.importOfflineValues(x);
            }));
            return arr.map(x => x.getValues());
        });
    }
    pushChangesToServer(throwOnError, p) {
        return __awaiter(this, void 0, void 0, function* () {
            if (throwOnError === undefined) {
                throwOnError = true;
            }
            if (!p) {
                p = new progress_1.Progress();
            }
            let all = yield this.offlineStore.getAllChanges();
            all = all.filter(x => x.status === interfaces_1.EntityStatus.EditFinished);
            p.totalCount(all.length);
            this.log("Found " + all.length + " changes to push in " + this.type.typeName);
            yield foreach(all, (x) => __awaiter(this, void 0, void 0, function* () {
                let item = this.getOrCreate(x[this.idField]);
                yield item.importOfflineValues(x);
                yield (item.pushToServer(true).then(() => {
                    p.completeCount(1);
                    this.log("Pushed " + this.type.typeName, item.__id);
                }, err => {
                    this.log("Error:Failed to push " + this.type.typeName, item.__id, err);
                    p.completeCount(1);
                    if (throwOnError) {
                        return Promise.reject(err);
                    }
                }));
            }));
        });
    }
    preloadItemsArray(ids) {
        ids = ids.filter(x => x != null);
        return this.getItemsArray(ids);
    }
    getItemsArray(ids, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids.length) {
                return [];
            }
            let proms = [];
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i];
                let item = this.getOrCreate(id);
                proms.push(item.ensureLoaded(fields).then(() => item.getValues()));
            }
            let loadedItems = yield Promise.all(proms);
            return loadedItems;
        });
    }
    log(...args) {
    }
}
__decorate([
    offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "resetChanges", null);
__decorate([
    offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "refreshItem", null);
__decorate([
    offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof T !== "undefined" && T) === "function" && _a || Object, Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "addOrUpdate", null);
__decorate([
    offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "queryAll", null);
__decorate([
    offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof T !== "undefined" && T) === "function" && _b || Object]),
    __metadata("design:returntype", typeof (_c = typeof T !== "undefined" && T) === "function" && _c || Object)
], EntityStore.prototype, "import", null);
exports.EntityStore = EntityStore;
class EntityMerger {
    constructor(metaProvider) {
        this.metaProvider = metaProvider;
    }
    merge(oldVals, newVals, type) {
        let current = _.cloneDeep(oldVals);
        this.__merge(current, newVals, type);
        return current;
    }
    __merge(current, newVals, type) {
        if (!newVals) {
            throw new Error("Object expected");
        }
        for (let k in newVals) {
            if (!newVals.hasOwnProperty(k) || typeof (newVals[k]) === 'function') {
                continue;
            }
            let p = type.getProp(k);
            if (!p || p.isSimple()) {
                current[k] = newVals[k];
            }
            else if (p.isNested) {
                if (!current[k]) {
                    current[k] = {};
                }
                this.__merge(current[k], newVals[k], this.metaProvider.getType(p.nestedTypeName));
            }
            else if (p.isNestedCollection) {
                if (!current[k]) {
                    current[k] = [];
                }
                let currentArr = current[k];
                let newArr = newVals[k];
                let itemType = this.metaProvider.getType(p.nestedCollTypeName);
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
exports.EntityMerger = EntityMerger;
class EntityMetaProvider {
    constructor(metas) {
        this.stores = {};
        this.ctors = {};
        this.lazyCtors = {};
        this.metas = metas.reduce((x, v) => {
            x[v.typeName] = v;
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
                    let v = LazyHelper.unwrap(vals[prop.name]);
                    if (v) {
                        let c = self.getEntityCtor(prop.nestedTypeName);
                        v = new c(v, depth + 1);
                        this.wraps[prop.name] = api_common_1.lazy(v);
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
            let store = self.stores[typeName];
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
class LazyHelper {
    static wrap(t) {
        return {
            getCached() {
                return t;
            },
            get() {
                return Promise.resolve(t);
            }
        };
    }
    static unwrap(serverValue) {
        if (!serverValue)
            return serverValue;
        if (serverValue.getCached)
            return serverValue.getCached();
        return serverValue;
    }
}
exports.LazyHelper = LazyHelper;
