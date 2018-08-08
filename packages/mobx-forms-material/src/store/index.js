"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityStore_1 = require("./internals/entityStore");
const mobx_1 = require("mobx");
class StoreRegistrator {
    constructor(m, o) {
        this.m = m;
        this.o = o;
    }
    register(typeName, online, offline, log) {
        let entityStore = new entityStore_1.EntityStore(offline, online, this.m, typeName, log);
        this.o.addSaveFunc((throwOnError, progress) => entityStore.pushChangesToServer(throwOnError, progress));
        return entityStore;
    }
}
function initStores(cfg) {
    let metaProvider = new entityStore_1.EntityMetaProvider(cfg.types.map(x => new entityStore_1.EntityTypeMeta(x)));
    let offlineChangesSaver = new entityStore_1.OfflineChangesSaver();
    let r = new StoreRegistrator(metaProvider, offlineChangesSaver);
    cfg.register(r);
    let p = Promise.resolve();
    let offlineMonFunc = mobx_1.autorun(() => {
        if (entityStore_1.isOnline()) {
            p = p.then(() => offlineChangesSaver.go());
        }
    });
    return p.then(() => ({
        dispose() {
            offlineMonFunc();
        }
    }));
}
exports.initStores = initStores;
