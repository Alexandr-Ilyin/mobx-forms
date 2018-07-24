export interface UpdateOptions {
    isNew?: boolean;
    isUnfinished?: boolean;
    skipServerWait?: boolean;
}
export declare enum EntityStatus {
    Unchanged = 0,
    EditFinished = 1,
    EditUnfinished = 2
}
export interface IEntityStore<T> {
    import(obj: T): T;
    addOrUpdate(newValues: T, o?: UpdateOptions): Promise<T>;
    getAllOfflines(): Promise<T[]>;
    getItem(id: any, fields?: string[]): Promise<T>;
    getItemsArray(ids: any[], fields?: string[]): Promise<T[]>;
    query(url: any, params?: any, force?: any): Promise<T[]>;
    queryAll(url: any, params?: any): Promise<T[]>;
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
    writeLog(id: any, logValue: T): Promise<{
        logId: any;
        logSize: any;
    }>;
}
export interface EntityTypeCfg {
    typeName?: string;
    props?: EntityPropCfg[];
}
export interface IOnlineStore<T> {
    query(path: any, params: any, force: any): Promise<T[]>;
    load(id: any, fields: string[]): Promise<T>;
    save(id: any, t: T, diff?: T): Promise<T>;
}
export declare class OfflineDataItem<T> {
    id: string;
    serverValues: T;
    clientValues: T;
    status: EntityStatus;
    isNew: any;
}
export interface IOfflineStore<T> {
    getAllChanges(): Promise<OfflineDataItem<T>[]>;
    getAll(): Promise<OfflineDataItem<T>[]>;
    find(id: any): Promise<OfflineDataItem<T>>;
    set(id: any, t: OfflineDataItem<T>): Promise<void>;
    isPersistent(): boolean;
}
export interface IStoreRegistrator {
    register<T>(typeName: any, online: IOnlineStore<T>, offline: IOfflineStore<T>, log: ILogStorage<T>): IEntityStore<T>;
}
export interface IStoreConfiguration {
    types: EntityTypeCfg[];
    register(registrator: IStoreRegistrator): any;
}
