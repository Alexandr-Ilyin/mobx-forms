import { EntityTypeCfg, IOnlineStore } from '../interfaces';
export declare abstract class RestOnline<T> implements IOnlineStore<T> {
    private _typeName;
    private batchCache;
    private _loadQueue;
    private type;
    constructor(type: EntityTypeCfg);
    getTypeName(): string;
    load(key: any, fields: string[]): Promise<T>;
    abstract query(path: any, params: any, force?: any): Promise<T[]>;
    abstract getItems(ids: FieldIds[]): Promise<T[]>;
    abstract save(id: any, t: T, diff?: T): Promise<T>;
}
export declare class FieldIds {
    fields: string;
    ids: string[];
}
