import * as _ from 'lodash';
import { IOfflineStore, OfflineDataItem } from '../interfaces';

export class InMemoryOffline<T> implements IOfflineStore<T> {

  items = {};

  async getAllChanges(): Promise<OfflineDataItem<T>[]> {
    return [];
  }

  async getAll(): Promise<OfflineDataItem<T>[]> {
    return _.values(this.items);
  }

  async find(id): Promise<OfflineDataItem<T>> {
    return this.items[id];
  }

  async set(id, t: OfflineDataItem<T>): Promise<void> {
    this.items[id] = t;
  }

  isPersistent(): boolean {
    return false;
  }

}
