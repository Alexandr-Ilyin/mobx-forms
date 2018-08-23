import { ILogStorage } from '../interfaces';
import { EntityLog } from '../internals/entityLog';
import { EntityMetaProvider } from '../internals/meta';

export class DummyLog<T> implements ILogStorage<T> {

  async getLogs(entityId): Promise<EntityLog<T>> {
    return new EntityLog<T>([], null);
  }

  writeLog(id, logValue: T): Promise<{ logId: any; logSize: any }> {
    return Promise.resolve(null);
  }

  initialize(typeName, m: EntityMetaProvider) {
  }


}
