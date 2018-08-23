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
const queue_1 = require("../utils/queue");
const trackAsync_1 = require("../utils/trackAsync");
const defer_1 = require("../utils/defer");
class RestOnline {
    constructor(type) {
        this.batchCache = {};
        this._loadQueue = new queue_1.Queue();
        this._typeName = type.typeName;
        this.type = type;
    }
    getTypeName() {
        return this.type.typeName;
    }
    load(key, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                throw new Error();
            }
            let batchCache = this.batchCache;
            let batch = batchCache[this._typeName];
            if (!batch) {
                let idField = this.type.props.find(x => x.isKey).name;
                batch = new IdLoadBatch(idField);
                batchCache[this._typeName] = batch;
                setTimeout(() => {
                    if (batch.loadStarted) {
                        return;
                    }
                    delete batchCache[this._typeName];
                    batch.load(this._loadQueue.makeQueued(this.getItems.bind(this)));
                }, 50);
            }
            batch.addKey(key, fields);
            if (batch.keyCount > 30) {
                delete batchCache[this._typeName];
                batch.load(this._loadQueue.makeQueued(this.getItems.bind(this)));
            }
            yield batch.waitLoaded();
            return batch.getResult(key);
        });
    }
}
__decorate([
    trackAsync_1.trackAsync(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], RestOnline.prototype, "load", null);
exports.RestOnline = RestOnline;
const batchCache = {};
class IdLoadBatch {
    constructor(keyField) {
        this.loadStarted = false;
        this.fieldsById = {};
        this.result = {};
        this.keyCount = 0;
        this.defer = new defer_1.Defer();
        this.keyField = keyField;
    }
    waitLoaded() {
        return this.defer.promise();
    }
    getResult(key) {
        return this.result[key];
    }
    addKey(key, fields) {
        if (!fields)
            fields = ["."];
        let keyFields = this.fieldsById[key];
        if (!keyFields) {
            keyFields = this.fieldsById[key] = {};
            this.keyCount++;
        }
        for (let i = 0; i < fields.length; i++) {
            let f = fields[i];
            keyFields[f] = true;
        }
    }
    load(loadFunc) {
        if (this.loadStarted) {
            return;
        }
        this.loadStarted = true;
        let idsByFields = {};
        _.each(this.fieldsById, (fields, id) => {
            let fieldsStr = _.keys(fields).sort().join(',');
            idsByFields[fieldsStr] = idsByFields[fieldsStr] || [];
            idsByFields[fieldsStr].push(id);
        });
        let query = [];
        _.each(idsByFields, (ids, fieldStr) => {
            query.push({
                fields: fieldStr,
                ids: ids
            });
        });
        loadFunc(query).then((res) => {
            for (let i = 0; i < res.length; i++) {
                let obj = res[i];
                this.result[obj[this.keyField]] = obj;
            }
            this.defer.resolve();
        }, err => {
            this.defer.reject(err);
        });
    }
}
class FieldIds {
}
exports.FieldIds = FieldIds;
