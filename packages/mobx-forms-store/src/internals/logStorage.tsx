import { ILogStorage } from '../interfaces';
import { ILazyWrapper } from '../utils/lazy';
import { checkDiff, DiffType, getJsonDiff } from '../utils/diffTools';
import { EntityMetaProvider } from './meta';
import { LazyWrapper } from './entityStore';
import { EntityLog } from './entityLog';
import { DexieWithSchema } from '../stores/dexieUtils';
import { LRUMap } from 'lru_map';


export class LogStorage<T> implements ILogStorage<T> {
  private tableName: string;
  private typeName: string;
  private cache = new LogCache();
  private wrapper: ILazyWrapper;
  private dexie: DexieWithSchema;

  constructor(tableName, dexie:DexieWithSchema) {
    this.tableName = tableName;
    this.dexie = dexie;
  }

  initialize(typeName, m:EntityMetaProvider){
    this.typeName = typeName;
    this.wrapper = new LazyWrapper(this.typeName,m);
  }

  async getLogs(entityId): Promise<EntityLog<T>>{
    let d = await this.getFromDexie(entityId);
    return new EntityLog(d, this.wrapper);
  }

  async writeLog(id, logValue: T):Promise<{ logId: any, logSize: any }> {
    logValue = this.wrapper.unwrapLazyFields(logValue);
    let cache = this.cache;
    let slf = this;

    let currentLog = this.cache.get(id);
    if (currentLog && currentLog.updateCount < 100) {
      currentLog.updateCount++;
      let diff = getDiff(currentLog.logValue, logValue);
      let diffType = checkDiff(diff);

      if (diffType == DiffType.noChanges) {
        return;
      }
      else if (diffType == DiffType.hasSmallChanges) {
        let updateCount = currentLog.updateCount;
        setTimeout(() => {
          if (updateCount == currentLog.updateCount) {
            addDiffLog(currentLog.logId, diff, logValue, currentLog.updateCount); // currentLog.logId + diff = logValue
          }
        }, 7000);
      }
      else {
        await addDiffLog(currentLog.logId, diff, logValue, currentLog.updateCount);
      }
    }
    else {
      await addValuesLog(logValue);
    }

    function getDiff(current: T, newVal: T) {
      return getJsonDiff(current, newVal);
    }

    async function addValuesLog(logValue: T) {
      let logId = await slf.writeToDexie({
          entityId: id,
          timeStamp: 1 * (new Date()as any),
          value: logValue
        }
      );
      cache.set(id, {
        logValue: logValue,
        logId: logId,
        updateCount: 0
      });
    }

    async function addDiffLog(parentLogId, diff, logValue, updateCount) {
      let logId = await slf.writeToDexie({
          entityId: id,
          timeStamp: 1 * (new Date()as any),
          parentLogId: parentLogId,
          diff: diff
        }
      );

      cache.set(id, {
        logValue: logValue,
        logId: logId,
        updateCount: updateCount
      });
    }
  }

  private async getFromDexie(entityId): Promise<LogEntry<T>[]> {
    let r = await this.dexie.useTable(this.tableName, async (t) => {
      return t.where({entityId: entityId}).toArray();
    });
    return r;
  }

  private async writeToDexie(logEntry: LogEntry<T>, id?): Promise<any> {
    let r = await this.dexie.useTable(this.tableName, async (t) => {
      if (!id) {
        return await t.put(logEntry);
      }
      await t.update(id, logEntry);
      return id;
    });
    return r;
  }
}


class LogCache {
  cache = new LRUMap(100);
  get(id): ILogCacheItem {
    return this.cache.get(id) as ILogCacheItem;
  }
  set(id, item: ILogCacheItem) {
    this.cache.set(id, item);
  }
}

interface ILogCacheItem {
  logValue: any,
  logId: any,
  updateCount: number,
}

export interface LogEntry<T> {
  id?;
  entityId;
  timeStamp;
  parentLogId?;
  diff?: any;
  value?: T;
  selected?: boolean;
}
