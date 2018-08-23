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
const dexie_1 = require("dexie");
const _ = require("lodash");
exports.isUpdatedField = 'isUpdated';
exports.localUpdateStatusField = 'localUpdateStatus';
exports.isNewField = 'isNew';
exports.idField = 'id';
function logFields() {
    return "++id,entityId,[entityId+timeStamp]";
}
exports.logFields = logFields;
function commonFields() {
    return exports.idField + "," + exports.isNewField + "," + exports.isUpdatedField + "," + exports.localUpdateStatusField;
}
exports.commonFields = commonFields;
function initDexie(dbName, patches) {
    return __awaiter(this, void 0, void 0, function* () {
        let fullSchema = {};
        let schemaArray = [];
        for (let i = 0; i < patches.length; i++) {
            let patch = patches[i];
            fullSchema = _.extend(fullSchema, patch);
            schemaArray.push(_.cloneDeep(fullSchema));
        }
        let r = new dexie_1.default(dbName);
        for (let i = 0; i < schemaArray.length; i++) {
            let vNum = schemaArray.length - 1 - i;
            r.version(vNum + 1).stores(schemaArray[vNum]);
        }
        yield r.open();
        return new DexieWithSchema(r, fullSchema);
    });
}
exports.initDexie = initDexie;
class DexieWithSchema {
    constructor(dexie, schema) {
        this.dexie = dexie;
        this.schema = schema;
    }
    useTable(tableName, func) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.useDb((dexie) => {
                let table = dexie.table(tableName);
                return func(table);
            }, [tableName]);
        });
    }
    useDb(func, tableNames) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = null;
            let tables = tableNames || _.keys(this.schema);
            yield this.dexie.transaction('rw', tables.map(x => this.dexie.table(x)), () => __awaiter(this, void 0, void 0, function* () {
                output = yield func(this.dexie);
            }));
            return output;
        });
    }
}
exports.DexieWithSchema = DexieWithSchema;
