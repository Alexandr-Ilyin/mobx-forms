
export interface UpdateOptions {
  isNew?: boolean;
  isUnfinished?: boolean;
  skipServerWait?: boolean;
}
export enum EntityStatus {
  Unchanged = 0,
  EditFinished = 1,
  EditUnfinished = 2,
}

export interface IEntityStore<T> {
  import(obj: T): T;
  addOrUpdate(newValues: T, o?: UpdateOptions):Promise<T>;
  getAllOfflines(): Promise<T[]>;
  getCached(id): T;
  getCachedOrLoad(id): T;
  getItem(id, fields?: string[]): Promise<T>;
  getItemsArray(ids: any[], fields?: string[]): Promise<T[]>
  query(url, params?, force?): Promise<T[]>
  queryAll(url, params?): Promise<T[]>;
}

export interface EntityPropCfg {
  name?: string;

  referenceTypeName?: string;
  isReference?: boolean;
  referencePropName?: string;

  isLazy?: boolean;
  isNested?: boolean;
  nestedTypeName?: string;

  isNestedCollection?: boolean;
  nestedCollTypeName?: string;
  isKey?: boolean;
}

export interface ILogStorage<T> {
  writeLog(id, logValue: T): Promise<{ logId: any, logSize: any }>
}

export interface EntityTypeCfg {
  typeName?: string;
  props?: EntityPropCfg[];
}

export interface IOnlineStore<T> {
  query(path, params, force?): Promise<T[]>;
  load(id, fields: string[]): Promise<T>;
  save(id, t: T, diff?: T): Promise<T>;
}

export class OfflineDataItem<T> {
  id: string;
  serverValues: T;
  clientValues: T;
  status: EntityStatus;
  isNew: any;
}

export interface IOfflineStore<T> {
  getAllChanges(): Promise<OfflineDataItem<T>[]>;
  getAll(): Promise<OfflineDataItem<T>[]>;
  find(id): Promise<OfflineDataItem<T>>;
  set(id, t: OfflineDataItem<T>): Promise<void>;
  isPersistent(): boolean;
}

export interface IStoreRegistrator
{
  register<T>(typeName,
              online :IOnlineStore<T>,
              offline:IOfflineStore<T>,
              log?: ILogStorage<T>):IEntityStore<T>
}

export interface IStoreConfiguration{

  types : EntityTypeCfg[],
  register(registrator:IStoreRegistrator);
}