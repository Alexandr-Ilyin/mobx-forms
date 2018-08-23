import Dexie from 'dexie';
export declare const isUpdatedField = "isUpdated";
export declare const localUpdateStatusField = "localUpdateStatus";
export declare const isNewField = "isNew";
export declare const idField = "id";
export declare function logFields(): string;
export declare function commonFields(): string;
export declare function initDexie(dbName: any, patches: Array<any>): Promise<DexieWithSchema>;
export declare class DexieWithSchema {
    constructor(dexie: Dexie, schema: {});
    dexie: Dexie;
    schema: {};
    useTable<T>(tableName: any, func: (table: Dexie.Table<any, any>) => Promise<T>): Promise<any>;
    useDb<T>(func: (dexie: Dexie) => Promise<T>, tableNames?: any): Promise<any>;
}
