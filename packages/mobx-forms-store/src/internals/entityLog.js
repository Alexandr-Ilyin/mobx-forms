"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toDict_1 = require("../utils/toDict");
const diffTools_1 = require("../utils/diffTools");
class EntityLog {
    constructor(logs, wrapper) {
        this.logs = logs;
        this.logDic = toDict_1.toDict(logs, x => x.id);
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
            let result = diffTools_1.applyJsonDiff(prev, e.diff);
            return result;
        }
        return null;
    }
}
exports.EntityLog = EntityLog;
