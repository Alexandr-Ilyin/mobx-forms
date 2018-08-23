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
const diffTools_1 = require("../utils/diffTools");
const entityStore_1 = require("./entityStore");
const entityLog_1 = require("./entityLog");
const lru_map_1 = require("lru_map");
class LogStorage {
    constructor(tableName, dexie) {
        this.cache = new LogCache();
        this.tableName = tableName;
        this.dexie = dexie;
    }
    initialize(typeName, m) {
        this.typeName = typeName;
        this.wrapper = new entityStore_1.LazyWrapper(this.typeName, m);
    }
    getLogs(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            let d = yield this.getFromDexie(entityId);
            return new entityLog_1.EntityLog(d, this.wrapper);
        });
    }
    writeLog(id, logValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logValue = this.wrapper.unwrapLazyFields(logValue);
            let cache = this.cache;
            let slf = this;
            let currentLog = this.cache.get(id);
            if (currentLog && currentLog.updateCount < 100) {
                currentLog.updateCount++;
                let diff = getDiff(currentLog.logValue, logValue);
                let diffType = diffTools_1.checkDiff(diff);
                if (diffType == diffTools_1.DiffType.noChanges) {
                    return;
                }
                else if (diffType == diffTools_1.DiffType.hasSmallChanges) {
                    let updateCount = currentLog.updateCount;
                    setTimeout(() => {
                        if (updateCount == currentLog.updateCount) {
                            addDiffLog(currentLog.logId, diff, logValue, currentLog.updateCount);
                        }
                    }, 7000);
                }
                else {
                    yield addDiffLog(currentLog.logId, diff, logValue, currentLog.updateCount);
                }
            }
            else {
                yield addValuesLog(logValue);
            }
            function getDiff(current, newVal) {
                return diffTools_1.getJsonDiff(current, newVal);
            }
            function addValuesLog(logValue) {
                return __awaiter(this, void 0, void 0, function* () {
                    let logId = yield slf.writeToDexie({
                        entityId: id,
                        timeStamp: 1 * new Date(),
                        value: logValue
                    });
                    cache.set(id, {
                        logValue: logValue,
                        logId: logId,
                        updateCount: 0
                    });
                });
            }
            function addDiffLog(parentLogId, diff, logValue, updateCount) {
                return __awaiter(this, void 0, void 0, function* () {
                    let logId = yield slf.writeToDexie({
                        entityId: id,
                        timeStamp: 1 * new Date(),
                        parentLogId: parentLogId,
                        diff: diff
                    });
                    cache.set(id, {
                        logValue: logValue,
                        logId: logId,
                        updateCount: updateCount
                    });
                });
            }
        });
    }
    getFromDexie(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.dexie.useTable(this.tableName, (t) => __awaiter(this, void 0, void 0, function* () {
                return t.where({ entityId: entityId }).toArray();
            }));
            return r;
        });
    }
    writeToDexie(logEntry, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.dexie.useTable(this.tableName, (t) => __awaiter(this, void 0, void 0, function* () {
                if (!id) {
                    return yield t.put(logEntry);
                }
                yield t.update(id, logEntry);
                return id;
            }));
            return r;
        });
    }
}
exports.LogStorage = LogStorage;
class LogCache {
    constructor() {
        this.cache = new lru_map_1.LRUMap(100);
    }
    get(id) {
        return this.cache.get(id);
    }
    set(id, item) {
        this.cache.set(id, item);
    }
}
