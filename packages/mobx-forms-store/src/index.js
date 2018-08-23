"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const meta_1 = require("./internals/meta");
const offlines_1 = require("./internals/offlines");
function initStores(stores, types) {
    let metaProvider = new meta_1.EntityMetaProvider(types);
    let offlineSaver = new offlines_1.OfflineChangesSaver();
    stores.forEach(x => x.initialize(metaProvider));
    stores.forEach(x => offlineSaver.addSaveFunc((throwOnError, progress) => x.pushChangesToServer(throwOnError, progress)));
    let p = Promise.resolve();
    let offlineMonFunc = mobx_1.autorun(() => {
        if (offlines_1.isOnline()) {
            p = p.then(() => offlineSaver.go());
        }
    });
    return p.then(() => ({
        getSavedChangeCount() {
            return offlineSaver.saved;
        },
        getChangeCount() {
            return offlineSaver.total;
        },
        setSaveDelay(v) {
            stores.forEach(x => x._saveDelay = v);
        },
        waitSaveFinished() {
            return offlineSaver.waitFinished();
        },
        dispose() {
            offlineMonFunc();
        }
    }));
}
exports.initStores = initStores;
