import {
  EntityMetaProvider,
  EntityStore,
  EntityTypeMeta,
  isOnline,
  OfflineChangesSaver,
} from './internals/entityStore';

import { IEntityStore, ILogStorage, IOfflineStore, IOnlineStore, IStoreConfiguration } from './interfaces';
import { autorun } from 'mobx';

class StoreRegistrator {
  m: EntityMetaProvider;
  private o: OfflineChangesSaver;

  constructor(m: EntityMetaProvider, o: OfflineChangesSaver) {
    this.m = m;
    this.o = o;
  }

  register<T>(typeName,
              online: IOnlineStore<T>,
              offline: IOfflineStore<T>,
              log: ILogStorage<T>): IEntityStore<T> {
    let entityStore = new EntityStore(offline, online, this.m, typeName, log);
    this.o.addSaveFunc((throwOnError, progress) => entityStore.pushChangesToServer(throwOnError, progress));
    return entityStore;
  }
}

export interface IStoreInstance {
  dispose();
}

export function initStores(cfg: IStoreConfiguration): Promise<IStoreInstance> {
  let metaProvider = new EntityMetaProvider(cfg.types.map(x => new EntityTypeMeta(x)));
  let offlineChangesSaver = new OfflineChangesSaver();
  let r = new StoreRegistrator(metaProvider, offlineChangesSaver);
  cfg.register(r);
  let p = Promise.resolve();
  let offlineMonFunc = autorun(() => {
    if (isOnline()) {
      p = p.then(() => offlineChangesSaver.go());
    }
  });
  return p.then(() => ({
    dispose() {
      offlineMonFunc();
    }
  }));
}

