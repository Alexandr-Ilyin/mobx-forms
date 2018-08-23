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
const progress_1 = require("../utils/progress");
const mobx_1 = require("mobx");
const interfaces_1 = require("../interfaces");
const queue_1 = require("../utils/queue");
const meta_1 = require("./meta");
const offlines_1 = require("./offlines");
const wait_1 = require("../utils/wait");
const trackAsync_1 = require("../utils/trackAsync");
const lazy_1 = require("../utils/lazy");
const entityMerger_1 = require("./entityMerger");
const guid_1 = require("../utils/guid");
const foreach_1 = require("../utils/foreach");
var _logType = null;
var _logStore = false;
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
        if (!this.__setServerValuesIfExpired(newValues)) {
            return;
        }
        this.__isNew = false;
        this.__loadedOnlineVersion = true;
        this.__updateClientValues();
        if (maybeOfflineHasUsefulLazies) {
            this.__queue.enqueue(() => this.__saveImportedValueOffline());
        }
        else {
            this.__queue.enqueue(() => this.__saveOffline());
        }
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
            if (offlines_1.isOffline()) {
                let offline = yield this.__store.offlineStore.find(this.__id);
                if (offline) {
                    this.__importOfflineValues(offline);
                }
                if (!this.__serverValues) {
                    throw offlines_1.getOfflineError();
                }
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
                yield this._ensureLazyLoaded(fields);
                yield this.__saveOffline();
            }
            else {
                let alreadyLoaded = yield this._ensureLazyLoaded(fields);
                if (!alreadyLoaded) {
                    yield this.__saveOffline();
                }
            }
        });
    }
    __canGetValues() {
        if (this.__isNew) {
            return true;
        }
        return !!(this.__loadedOnlineVersion || this.__loadedOfflineChanges);
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
            if (off.status == interfaces_1.EntityStatus.EditFinished || off.status == interfaces_1.EntityStatus.EditUnfinished) {
                if (this.__store.logStorage) {
                    this.__store.logStorage.writeLog(this.__id, this.__getClientValues());
                }
            }
        });
    }
    __pushToServer(waitServerSave, saveDelay) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.__store.offlineStore.isPersistent()) {
                waitServerSave = true;
            }
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
                    saveDelay = this.__store._saveDelay;
                }
                else {
                    saveDelay = 0;
                }
            }
            let savePromise = wait_1.wait(saveDelay).then(() => {
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
            savePromise = trackAsync_1.wrapAsync(savePromise);
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
        if (!_logStore) {
            return;
        }
        if (_logType != null && this.__store.type.typeName != _logType) {
            return;
        }
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
            if (!unfinished && offlines_1.isOnline()) {
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
            if (!offlines_1.isOnline() || this.__clientValues) {
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
            if (offlines_1.isOnline()) {
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
    _ensureLazyLoaded(fields) {
        return __awaiter(this, void 0, void 0, function* () {
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
                let lazy = wrapper[f];
                if (lazy && lazy.getCached) {
                    if (!lazy.getCached()) {
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
class LazyWrapper {
    constructor(typeName, provider) {
        this.typeName = typeName;
        this.provider = provider;
    }
    wrapLazyFields(t) {
        if (!t) {
            return t;
        }
        let res = {};
        let type = this.provider.getType(this.typeName);
        type.props.forEach(x => {
            let v = t[x.name];
            if (v === undefined) {
                return;
            }
            if (x.isLazy) {
                res[x.name] = lazy_1.Lazy.wrap(v);
            }
            else {
                res[x.name] = v;
            }
        });
        return res;
    }
    unwrapLazyFields(t) {
        if (!t) {
            return t;
        }
        let res = {};
        let type = this.provider.getType(this.typeName);
        type.props.forEach(x => {
            let v = t[x.name];
            if (v === undefined) {
                return;
            }
            if (x.isLazy) {
                res[x.name] = lazy_1.Lazy.unwrap(v);
            }
            else {
                res[x.name] = v;
            }
        });
        return res;
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
class OfflineDataItem {
}
exports.OfflineDataItem = OfflineDataItem;
class EntityStore {
    constructor(typeCfg, offlineStore, onlineStore, logStorage) {
        this._cache = {};
        this.offlineStore = offlineStore;
        this.onlineStore = onlineStore;
        this.logStorage = logStorage;
        this.type = new meta_1.EntityTypeMeta(typeCfg);
    }
    initialize(metaProvider) {
        let typeName = this.type.typeName;
        metaProvider.regStore(typeName, this);
        this.idField = metaProvider.getIdField(typeName);
        this.entityWrapCtor = metaProvider.getEntityCtor(typeName);
        this.merger = new entityMerger_1.EntityMerger(metaProvider);
        this.wrapper = new LazyWrapper(typeName, metaProvider);
        this.offlineStore.initialize(typeName, metaProvider);
        if (this.logStorage)
            this.logStorage.initialize(typeName, metaProvider);
    }
    loadFieldValue(entityId, field) {
        return __awaiter(this, void 0, void 0, function* () {
            let entity = this.getOrCreate(entityId);
            if (entity.__isNew) {
                return entity.__clientValues[field];
            }
            if (entity.__serverValues && entity.__serverValues[field] != null) {
                return entity.__serverValues[field];
            }
            let sourceData = yield this.onlineStore.load(entityId, [field]);
            return sourceData[field];
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
        v.getValues().listen();
        return v.__status !== interfaces_1.EntityStatus.Unchanged;
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
                id = guid_1.guid();
                isNew = true;
                newValues[this.idField] = id;
            }
            let item = this.getOrCreate(id);
            if (isNew) {
                item.__isNew = isNew;
            }
            yield item.setClientValues(newValues, unfinished, !skipServerWait);
            return item.getValues();
        });
    }
    isCreatedOffline(id) {
        let item = this.getOrCreate(id);
        return item.isCreatedOffline();
    }
    queryAll(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (offlines_1.isOffline()) {
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
                if (obj) {
                    result.push(obj);
                }
            }
            if (this.type.getProp("isDeleted")) {
                result = result.filter(x => !x.isDeleted);
            }
            return result;
        });
    }
    getVersionProp() {
        return this.type.getProp("rowVersion");
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
        item.importOnlineServerValues(obj);
        return item.getValues();
    }
    getAllOfflines() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._allOfflineLoaded) {
                this._allOfflineLoaded = this.__getAllOfflines();
            }
            yield this._allOfflineLoaded;
            return _.values(this._cache).map((x) => {
                let values = x.getValues();
                if (values == null) {
                    this.log("Found unfinished value", x.__id);
                }
                return values;
            }).filter(x => {
                return x != null;
            });
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
        if (values != null) {
            return values;
        }
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
            yield foreach_1.foreach(all, (x) => __awaiter(this, void 0, void 0, function* () {
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
            yield foreach_1.foreach(all, (x) => __awaiter(this, void 0, void 0, function* () {
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
    listen(entity) {
        entity.listen();
    }
}
__decorate([
    offlines_1.offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "resetChanges", null);
__decorate([
    offlines_1.offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "refreshItem", null);
__decorate([
    offlines_1.offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof T !== "undefined" && T) === "function" && _a || Object, Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "addOrUpdate", null);
__decorate([
    offlines_1.offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EntityStore.prototype, "queryAll", null);
__decorate([
    offlines_1.offlineRetry(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof T !== "undefined" && T) === "function" && _b || Object]),
    __metadata("design:returntype", typeof (_c = typeof T !== "undefined" && T) === "function" && _c || Object)
], EntityStore.prototype, "import", null);
exports.EntityStore = EntityStore;
