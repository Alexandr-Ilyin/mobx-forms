import { EntityStore } from '../src/internals/entityStore';
import { EntityTypeCfg } from '../src/interfaces';
import { InMemoryOffline } from '../src/stores/inmemOffline';
import { RestOnline, FieldIds } from '../src/stores/restOnline';
import { initStores } from '../src/index';
import { wait } from '../src/utils/wait';
import { commonFields, initDexie } from '../src/stores/dexieUtils';
import { DexieOffline } from '../src/stores/dexieOffline';
import * as assert from "assert";

class OnlineStore<T> extends RestOnline<T> {
  items = {};

  async getItems(ids: FieldIds[]): Promise<T[]> {
    await wait(10);
    let arr = [];
    ids.forEach(x => x.ids.forEach(a => arr.push(a)));
    return arr.map(x => this.items[x]);
  }

  query(path, params, force?): Promise<T[]> {
    return undefined;
  }

  async save(id, t: any, diff?: any): Promise<T> {
    return this.items[id] = t;
  }
}

let type: EntityTypeCfg = {
  typeName: 'User',
  props: [
    { name: 'id', isKey: true },
    { name: 'fio', isKey: false }
  ]
};

describe("store", async function() {

  it("should return item from dexie", async function() {

    let dexie = await initDexie("test-db", [{User: commonFields()}]);
    let onlineStore = new OnlineStore<any>(type);
    let store = new EntityStore<any>(type, new DexieOffline('User',dexie), onlineStore, null);
    onlineStore.items['1'] = { id: '1', fio: 'U1' };
    await initStores([store]);
    let item = await store.getItem('1');
    assert.equal(item.fio, 'U1');
  });

  it("should return item", async function() {

    let onlineStore = new OnlineStore<any>(type);
    let store = new EntityStore<any>(type, new InMemoryOffline(), onlineStore, null);
    onlineStore.items['1'] = { id: '1', fio: 'U1' };
    await initStores([store]);
    let item = await store.getItem('1');
    assert.equal(item.fio, 'U1');
  });
});
