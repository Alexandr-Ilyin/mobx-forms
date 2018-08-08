import { EntityTypeCfg, IOnlineStore } from '../interfaces';
import { Queue } from '../../common/queue';
import * as _ from 'lodash';
import { Defer } from '../internals/entityStore';
import { trackAsync } from '../../common/trackAsync';

export abstract class BatchedOnline<T> implements IOnlineStore<T> {
  private _typeName: string;
  private batchCache = {};
  private _loadQueue = new Queue();
  private type: EntityTypeCfg;

  constructor(type: EntityTypeCfg) {
    this._typeName = type.typeName;
    this.type = type;
  }

  @trackAsync()
  async load(key, fields: string[]): Promise<T> {

    if (!key) {
      throw new Error();
    }
    let batchCache = this.batchCache;
    let batch: IdLoadBatch<T> = batchCache[this._typeName];
    if (!batch) {
      let idField = this.type.props.find(x=>x.isKey).name;
      batch = new IdLoadBatch<T>(idField);
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
    await batch.waitLoaded();
    return batch.getResult(key);
  }

  abstract query(path, params, force?): Promise<T[]>;
  abstract getItems(ids: FieldIds[]): Promise<T[]>;
  abstract save(id, t: T, diff?: T): Promise<T>;
}


const batchCache = {};

class IdLoadBatch<T> {
  private defer: Defer<T[]>;
  loadStarted = false;
  fieldsById = {};
  result = {};
  keyField;
  keyCount = 0;

  constructor(keyField) {
    this.defer = new Defer<T[]>();
    this.keyField = keyField;
  }

  waitLoaded(): Promise<T[]> {
    return this.defer.promise();
  }

  getResult(key): T {
    return this.result[key];
  }

  addKey(key, fields?: string[]): void {
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

  load(loadFunc: (ids: FieldIds[]) => Promise<T[]>) {
    if (this.loadStarted) {
      return;
    }
    this.loadStarted = true;
    let idsByFields = {};
    _.each(this.fieldsById, (fields,id) => {
      let fieldsStr = _.keys(fields).sort().join(',');
      idsByFields[fieldsStr] = idsByFields[fieldsStr] || [];
      idsByFields[fieldsStr].push(id);
    });
    let query: FieldIds[] = [];
    _.each(idsByFields, (ids:string[], fieldStr: string) => {
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

export class FieldIds {
  fields: string;
  ids: string[];
}