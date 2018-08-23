import { ILogStorage } from '../interfaces';
import { EntityMetaProvider } from './meta';
import { EntityLog } from './entityLog';
import { DexieWithSchema } from '../stores/dexieUtils';
export declare class LogStorage<T> implements ILogStorage<T> {
    private tableName;
    private typeName;
    private cache;
    private wrapper;
    private dexie;
    constructor(tableName: any, dexie: DexieWithSchema);
    initialize(typeName: any, m: EntityMetaProvider): void;
    getLogs(entityId: any): Promise<EntityLog<T>>;
    writeLog(id: any, logValue: T): Promise<{
        logId: any;
        logSize: any;
    }>;
    private getFromDexie;
    private writeToDexie;
}
export interface LogEntry<T> {
    id?: any;
    entityId: any;
    timeStamp: any;
    parentLogId?: any;
    diff?: any;
    value?: T;
    selected?: boolean;
}
