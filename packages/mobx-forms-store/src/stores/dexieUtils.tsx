import Dexie from 'dexie';
import * as _ from 'lodash';


export const isUpdatedField = 'isUpdated';
export const localUpdateStatusField = 'localUpdateStatus';
export const isNewField = 'isNew';
export const idField = 'id';

export function logFields(){
  return "++id,entityId,[entityId+timeStamp]";
}
export function commonFields(){
  return idField + "," + isNewField + "," + isUpdatedField + "," + localUpdateStatusField;
}
export async function initDexie(dbName, patches: Array<any>): Promise<DexieWithSchema> {

  let fullSchema = {};
  let schemaArray = [];
  for (let i = 0; i < patches.length; i++) {
    let patch = patches[i];
    fullSchema = _.extend(fullSchema, patch);
    schemaArray.push(_.cloneDeep(fullSchema));
  }
  let r = new Dexie(dbName);
  for (let i = 0; i < schemaArray.length; i++) {
    let vNum = schemaArray.length - 1 - i;
    r.version(vNum + 1).stores(schemaArray[vNum]);
  }
  await r.open();
  return new DexieWithSchema(r, fullSchema);
}

export class DexieWithSchema{

  constructor(dexie: Dexie, schema: {}) {
    this.dexie = dexie;
    this.schema = schema;
  }

  dexie:Dexie;
  schema:{};

  async useTable<T>(tableName, func: (table: Dexie.Table<any, any>) => Promise<T>):Promise<any> {
    return this.useDb((dexie) => {
      let table = dexie.table(tableName);

      return func(table);
    }, [tableName])
  }

  async useDb<T>(func: (dexie: Dexie) => Promise<T>, tableNames?) {
    let output = null;
    let tables = tableNames || _.keys(this.schema);
    await this.dexie.transaction('rw', tables.map(x => this.dexie.table(x)), async() => {
      output = await func(this.dexie);
    });
    return output;
  }


}