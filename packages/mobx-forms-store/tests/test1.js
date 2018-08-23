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
const entityStore_1 = require("../src/internals/entityStore");
const inmemOffline_1 = require("../src/stores/inmemOffline");
const restOnline_1 = require("../src/stores/restOnline");
const index_1 = require("../src/index");
const wait_1 = require("../src/utils/wait");
const dexieUtils_1 = require("../src/stores/dexieUtils");
const dexieOffline_1 = require("../src/stores/dexieOffline");
const assert = require("assert");
class OnlineStore extends restOnline_1.RestOnline {
    constructor() {
        super(...arguments);
        this.items = {};
    }
    getItems(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait_1.wait(10);
            let arr = [];
            ids.forEach(x => x.ids.forEach(a => arr.push(a)));
            return arr.map(x => this.items[x]);
        });
    }
    query(path, params, force) {
        return undefined;
    }
    save(id, t, diff) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.items[id] = t;
        });
    }
}
let type = {
    typeName: 'User',
    props: [
        { name: 'id', isKey: true },
        { name: 'fio', isKey: false }
    ]
};
describe("store", function () {
    return __awaiter(this, void 0, void 0, function* () {
        it("should return item from dexie", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let dexie = yield dexieUtils_1.initDexie("test-db", [{ User: dexieUtils_1.commonFields() }]);
                let onlineStore = new OnlineStore(type);
                let store = new entityStore_1.EntityStore(type, new dexieOffline_1.DexieOffline('User', dexie), onlineStore, null);
                onlineStore.items['1'] = { id: '1', fio: 'U1' };
                yield index_1.initStores([store]);
                let item = yield store.getItem('1');
                assert.equal(item.fio, 'U1');
            });
        });
        it("should return item", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let onlineStore = new OnlineStore(type);
                let store = new entityStore_1.EntityStore(type, new inmemOffline_1.InMemoryOffline(), onlineStore, null);
                onlineStore.items['1'] = { id: '1', fio: 'U1' };
                yield index_1.initStores([store]);
                let item = yield store.getItem('1');
                assert.equal(item.fio, 'U1');
            });
        });
    });
});
