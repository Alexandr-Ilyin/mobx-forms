import * as _ from "lodash";
import { EntityStatus, IOfflineStore } from '../interfaces';
import { Queue } from '../utils/queue';
import { ILazyWrapper } from '../utils/lazy';
import { LazyWrapper, OfflineDataItem } from '../internals/entityStore';
import { Defer } from '../utils/defer';
import { DexieWithSchema } from './dexieUtils';
import { trackAsync } from '../utils/trackAsync';
import { EntityMetaProvider } from '../internals/meta';
let logDexie = false;
export const isUpdatedField = 'isUpdated';

export class DexieOffline<T> implements IOfflineStore<T> {
  private tableName;
  private currentBatch: DexieWriteBatch<T> = null;
  private dexie: DexieWithSchema;
  _writeQueue = new Queue();
  _waitQueue = new Queue();
  wrapper:ILazyWrapper;


  constructor(tableName, dexie:DexieWithSchema) {
    this.tableName = tableName;
    this.dexie = dexie;
  }

  initialize(typeName, metaProvider:EntityMetaProvider){
    this.wrapper = new LazyWrapper(typeName, metaProvider);
  }

  isPersistent(): boolean {
    return true;
  }

  async getAllChanges(): Promise<OfflineDataItem<T>[]> {
    this.log("Waiting  " + this._waitQueue.length);
    await this._waitQueue.promise;

    let filter = {};
    filter[isUpdatedField] = 1;

    let changes:OfflineDataItem<T>[] = (await this.dexie.useTable(this.tableName, t => t.where(filter).toArray()));
    changes.forEach(x=> {
      this.wrapStoredItemLazies(x);
      return x;
    });
    return changes;
  }

  private log(...args) {
    //console.log.apply(console, arguments);
  }

  async getAll(): Promise<OfflineDataItem<T>[]> {
    await this._waitQueue.promise;
    let r = await this.dexie.useTable(this.tableName, (t) => t.toArray());
    r.forEach(x=>this.wrapStoredItemLazies(x));
    return r;
  }

  async where(field, value): Promise<OfflineDataItem<T>[]> {
    await this._waitQueue.promise;
    let r = await this.dexie.useTable(this.tableName, (t) => t.where(field).equals(value).toArray());
    r.forEach(x=>this.wrapStoredItemLazies(x));
    return r;
  }

  async find(id): Promise<OfflineDataItem<T>> {
    await this._waitQueue.promise;
    if (!id || typeof(id) != "string") {
      throw new Error();
    }
    let fromDexie = await this.dexie.useDb((d) => d.table(this.tableName).get(id));
    logDexie && console.log("Got from dexie", this.tableName, id, fromDexie);
    this.wrapStoredItemLazies(fromDexie);
    return fromDexie;
  }

  async set(id, t: OfflineDataItem<T>): Promise<void> {
    logDexie && console.log("Put in dexie", this.tableName, t);
    let changed = t.status === EntityStatus.EditFinished || t.status === EntityStatus.EditUnfinished;
    t[isUpdatedField] = changed ? 1 : 0;
    if (t.isNew) {
      t.isNew = 1;
    } else {
      t.isNew = 0;
    }

    await this.writeBatched(t);
  }

  @trackAsync()
  async writeBatched(item: OfflineDataItem<T>): Promise<void> {
    if (!item) {
      throw new Error();
    }
    let batch = this.currentBatch;
    if (!batch) {
      batch = this.currentBatch = new DexieWriteBatch<T>();
      this._waitQueue.enqueue(() => batch.waitSaved());
      this.log("Wait " + this._waitQueue.length);
      this._waitQueue.enqueue(() => "Resolved!");

      setTimeout(() => {
        if (batch.loadStarted) {
          return;
        }
        this.currentBatch = null;
        batch.write(this._writeQueue.makeQueued(this.writeItemsArrayPrivate.bind(this)));
      }, 1);
    }

    batch.addItem(item);
    if (_.values(batch.itemsToWrite).length >= 100) {
      batch.write(this._writeQueue.makeQueued(this.writeItemsArrayPrivate.bind(this)));
      this.currentBatch = null;
    }
    await batch.waitSaved();
  }

  private async writeItemsArrayPrivate(items: OfflineDataItem<T>[]): Promise<void> {
    if (logDexie)
      console.log("Bulk write " + items.length + " in " + this.tableName);

    await this.dexie.useTable(this.tableName, async (tbl) => {
      let exisingItems = await tbl.where("id").anyOf(this.getKeys(items)).toArray();
      this.saveLazyIfMissing(exisingItems, items);
      let insertedValues = items.map(x => this.unwrapLazy(x));
      return tbl.bulkPut(insertedValues);
    });
    if (logDexie)
      console.log("Bulk written " + items.length + " in " + this.tableName, items);
  }

  private saveLazyIfMissing(from: OfflineDataItem<T>[], to: OfflineDataItem<T>[]) {
    this.wrapper.getLazyFieldNames().forEach(f => {
      if (from[f] != null && to[f] == null)
        to[f] = from[f];
    });
  }

  wrapStoredItemLazies(item:OfflineDataItem<T>):void
  {
  }

  private unwrapLazy(item: OfflineDataItem<T>) {
    return item;
  }

  private getKeys(items: OfflineDataItem<T>[]) {
    return items.map(x => x.id);
  }
}

class DexieWriteBatch<T> {
  defer: Defer<OfflineDataItem<T>[]>;
  loadStarted = false;
  itemsToWrite = {};

  constructor() {
    this.defer = new Defer<OfflineDataItem<T>[]>();
  }

  waitSaved(): Promise<OfflineDataItem<T>[]> {
    return this.defer.promise();
  }

  addItem(item: OfflineDataItem<T>) {
    this.itemsToWrite[item.id] = item;
  }

  write(writeFunc: (params) => Promise<OfflineDataItem<T>[]>) {
    if (this.loadStarted) {
      return;
    }
    this.loadStarted = true;

    writeFunc(_.values(this.itemsToWrite)).then(() => {
      this.defer.resolve();
    }, err => {
      this.defer.reject(err);
      console.log(err);
    });
  }
}