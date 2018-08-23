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
const _ = require("lodash");
const interfaces_1 = require("../interfaces");
const queue_1 = require("../utils/queue");
const entityStore_1 = require("../internals/entityStore");
const defer_1 = require("../utils/defer");
const trackAsync_1 = require("../utils/trackAsync");
let logDexie = false;
exports.isUpdatedField = 'isUpdated';
class DexieOffline {
    constructor(tableName, dexie) {
        this.currentBatch = null;
        this._writeQueue = new queue_1.Queue();
        this._waitQueue = new queue_1.Queue();
        this.tableName = tableName;
        this.dexie = dexie;
    }
    initialize(typeName, metaProvider) {
        this.wrapper = new entityStore_1.LazyWrapper(typeName, metaProvider);
    }
    isPersistent() {
        return true;
    }
    getAllChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("Waiting  " + this._waitQueue.length);
            yield this._waitQueue.promise;
            let filter = {};
            filter[exports.isUpdatedField] = 1;
            let changes = (yield this.dexie.useTable(this.tableName, t => t.where(filter).toArray()));
            changes.forEach(x => {
                this.wrapStoredItemLazies(x);
                return x;
            });
            return changes;
        });
    }
    log(...args) {
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._waitQueue.promise;
            let r = yield this.dexie.useTable(this.tableName, (t) => t.toArray());
            r.forEach(x => this.wrapStoredItemLazies(x));
            return r;
        });
    }
    where(field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._waitQueue.promise;
            let r = yield this.dexie.useTable(this.tableName, (t) => t.where(field).equals(value).toArray());
            r.forEach(x => this.wrapStoredItemLazies(x));
            return r;
        });
    }
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._waitQueue.promise;
            if (!id || typeof (id) != "string") {
                throw new Error();
            }
            let fromDexie = yield this.dexie.useDb((d) => d.table(this.tableName).get(id));
            logDexie && console.log("Got from dexie", this.tableName, id, fromDexie);
            this.wrapStoredItemLazies(fromDexie);
            return fromDexie;
        });
    }
    set(id, t) {
        return __awaiter(this, void 0, void 0, function* () {
            logDexie && console.log("Put in dexie", this.tableName, t);
            let changed = t.status === interfaces_1.EntityStatus.EditFinished || t.status === interfaces_1.EntityStatus.EditUnfinished;
            t[exports.isUpdatedField] = changed ? 1 : 0;
            if (t.isNew) {
                t.isNew = 1;
            }
            else {
                t.isNew = 0;
            }
            yield this.writeBatched(t);
        });
    }
    writeBatched(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item) {
                throw new Error();
            }
            let batch = this.currentBatch;
            if (!batch) {
                batch = this.currentBatch = new DexieWriteBatch();
                this._waitQueue.enqueue(() => batch.waitSaved());
                this.log("Wait " + this._waitQueue.length);
                this._waitQueue.enqueue(() => "Resolved!");
                setTimeout(() => {
                    if (batch.loadStarted) {
                        return;
                    }
                    this.currentBatch = null;
                    batch.write(this._writeQueue.makeQueued(this.writeItemsArrayPrivate.bind(this)));
                }, 1);
            }
            batch.addItem(item);
            if (_.values(batch.itemsToWrite).length >= 100) {
                batch.write(this._writeQueue.makeQueued(this.writeItemsArrayPrivate.bind(this)));
                this.currentBatch = null;
            }
            yield batch.waitSaved();
        });
    }
    writeItemsArrayPrivate(items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (logDexie)
                console.log("Bulk write " + items.length + " in " + this.tableName);
            yield this.dexie.useTable(this.tableName, (tbl) => __awaiter(this, void 0, void 0, function* () {
                let exisingItems = yield tbl.where("id").anyOf(this.getKeys(items)).toArray();
                this.saveLazyIfMissing(exisingItems, items);
                let insertedValues = items.map(x => this.unwrapLazy(x));
                return tbl.bulkPut(insertedValues);
            }));
            if (logDexie)
                console.log("Bulk written " + items.length + " in " + this.tableName, items);
        });
    }
    saveLazyIfMissing(from, to) {
        this.wrapper.getLazyFieldNames().forEach(f => {
            if (from[f] != null && to[f] == null)
                to[f] = from[f];
        });
    }
    wrapStoredItemLazies(item) {
    }
    unwrapLazy(item) {
        return item;
    }
    getKeys(items) {
        return items.map(x => x.id);
    }
}
__decorate([
    trackAsync_1.trackAsync(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entityStore_1.OfflineDataItem]),
    __metadata("design:returntype", Promise)
], DexieOffline.prototype, "writeBatched", null);
exports.DexieOffline = DexieOffline;
class DexieWriteBatch {
    constructor() {
        this.loadStarted = false;
        this.itemsToWrite = {};
        this.defer = new defer_1.Defer();
    }
    waitSaved() {
        return this.defer.promise();
    }
    addItem(item) {
        this.itemsToWrite[item.id] = item;
    }
    write(writeFunc) {
        if (this.loadStarted) {
            return;
        }
        this.loadStarted = true;
        writeFunc(_.values(this.itemsToWrite)).then(() => {
            this.defer.resolve();
        }, err => {
            this.defer.reject(err);
            console.log(err);
        });
    }
}
