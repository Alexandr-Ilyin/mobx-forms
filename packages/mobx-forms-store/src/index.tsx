
import {
  EntityTypeCfg,
  IEntityStore,
  ILogStorage,
  IOfflineStore,
  IOnlineStore,
  IStoreConfiguration
} from './interfaces';
import { autorun } from 'mobx';
import { EntityMetaProvider, EntityTypeMeta } from './internals/meta';
import { isOnline, OfflineChangesSaver } from './internals/offlines';
import { EntityStore } from './internals/entityStore';


export interface IOfflineStorageManager {
  waitSaveFinished():Promise<void>,
  getSavedChangeCount():number,
  getChangeCount():number,
  setSaveDelay(v);
  dispose();
}

export function initStores(stores: EntityStore<any>[],types:EntityTypeCfg[]): Promise<IOfflineStorageManager> {
  let metaProvider = new EntityMetaProvider(types);
  let offlineSaver = new OfflineChangesSaver();

   stores.forEach(x=>x.initialize(metaProvider));
  stores.forEach(x=>offlineSaver.addSaveFunc(
    (throwOnError, progress) => x.pushChangesToServer(throwOnError, progress)));
  let p = Promise.resolve();
  let offlineMonFunc = autorun(() => {
    if (isOnline()) {
      p = p.then(() => offlineSaver.go());
    }
  });
  return p.then(() => ({
    getSavedChangeCount(){
      return offlineSaver.saved;
    },
    getChangeCount(){
      return offlineSaver.total;
    },

    setSaveDelay(v){
      stores.forEach(x=>x._saveDelay=v);
    },

    waitSaveFinished(){
      return offlineSaver.waitFinished();
    },
    dispose() {
      offlineMonFunc();
    }
  }));
}

