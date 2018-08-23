import { ILogStorage } from '../interfaces';
import { EntityLog } from '../internals/entityLog';
import { EntityMetaProvider } from '../internals/meta';
export declare class DummyLog<T> implements ILogStorage<T> {
    getLogs(entityId: any): Promise<EntityLog<T>>;
    writeLog(id: any, logValue: T): Promise<{
        logId: any;
        logSize: any;
    }>;
    initialize(typeName: any, m: EntityMetaProvider): void;
}
