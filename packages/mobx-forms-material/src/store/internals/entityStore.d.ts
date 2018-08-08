import { Progress } from './progress';
import { EntityStatus, EntityTypeCfg, ILogStorage, IOfflineStore, IOnlineStore } from '../interfaces';
import { Queue } from '../../common/queue';
export declare class OfflineChangesSaver {
    saved: number;
    total: number;
    saveFuncs: Array<(throwOnErr: boolean, p: Progress) => void>;
    q: Queue;
    go(): Promise<void>;
    waitFinished(): Promise<any>;
    addSaveFunc(saveFunc: (throwOnErr: boolean, p: Progress) => void): Promise<void>;
    _go(): Promise<void>;
    readonly isFinished: boolean;
}
export declare function emualtedOffline(): boolean;
export declare function startOfflineMonitoring(): void;
export declare function setRealOnline(): void;
export declare function isOffline(): boolean;
export declare function setOnline(v?: boolean): void;
export declare function setOffline(v?: boolean): void;
export declare function retryOffline<T>(func: any): () => any;
export declare function once(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function incLocalVersion(entity: any): number;
export declare function listenEntity(entity: any): any;
export declare function isNotFoundError(e: any): boolean;
export declare function isConcurrencyError(e: any): any;
export interface UpdateOptions {
    isNew?: boolean;
    isUnfinished?: boolean;
    skipServerWait?: boolean;
}
export declare function foreach<T>(arr: T[], func: (x: T) => Promise<any>): Promise<any>;
export declare function guid(): string;
export declare function getStrDiff(source: any, target: any): any[];
export declare function applyStrDiff(source: any, patch: any): string;
export declare function wait(time: any): Promise<void>;
export declare function wrapAsync<T>(p: Promise<T>): Promise<T>;
export declare class Defer<TResult> {
    private _resolveFunc;
    private _errorFunc;
    private _promise;
    private _fail;
    private _result;
    private finished;
    constructor();
    private _tryFinish;
    reject(error?: any): void;
    resolve(res?: TResult): void;
    promise(): any;
}
export declare function getOfflineError(url?: any): any;
export declare function isOfflineError(err: any): boolean;
export declare function isOnline(): boolean;
export declare function offlineRetry(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class Entity<T> {
    __id: any;
    __store: EntityStore<T>;
    __version: number;
    __serverValues: T;
    __clientValues: T;
    __status: EntityStatus;
    __queue: Queue;
    __saveQueue: Queue;
    __loadedOfflineChanges: any;
    __loadedOnlineVersion: any;
    __isNew: any;
    __valuesWrapper: any;
    readonly saveQueue: Queue;
    constructor(store: EntityStore<T>, _id: any);
    pushToServer(waitServerSave: boolean): Promise<any>;
    setClientValues(newValues: T, final: boolean, waitServer: boolean): Promise<any>;
    saveFieldOffline(field: any, value: any): Promise<any>;
    resetValues(): Promise<void>;
    refreshValues(): Promise<void>;
    ensureLoaded(fields?: string[]): Promise<void>;
    getValues(): T;
    importOfflineValues(newValues: OfflineDataItem<T>): void;
    __setServerValuesIfExpired(newValues: T): boolean;
    importOnlineServerValues(newValues: T): void;
    isCreatedOffline(): any;
    private __saveImportedValueOffline;
    private __importOfflineValues;
    private __ensureLoaded;
    private __canGetValues;
    private __getValues;
    ____getOrCreateWrapper(): any;
    __updateClientValues(): void;
    __getClientValues(): any;
    private __saveFieldOffline;
    private __saveOffline;
    private __pushToServer;
    private logError;
    private log;
    private __setClientValues;
    private __refreshValues;
    private __resetValues;
    private _isLoaded;
    private _ensureLazyLoaded;
}
export declare function applyJsonDiff(source: any, diff: any): any;
export declare class LazyWrapper implements ILazyWrapper {
    lazyfieldNames: string[];
    lazyfieldNamesJson: any;
    provider: EntityMetaProvider;
    private typeName;
    constructor(typeName: any, provider: EntityMetaProvider);
    wrapLazyFields<T>(t: T): T;
    unwrapLazyFields<T>(t: T): T;
    getLazyFieldNamesJson(): any;
    getLazyFieldNames(): string[];
}
export declare function toDict<T>(arr: T[], f: (t: T) => any): {
    [key: string]: T;
};
export interface ILazyWrapper {
    wrapLazyFields<T>(t: T): T;
    unwrapLazyFields<T>(t: T): T;
    getLazyFieldNames(): string[];
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
export declare class EntityLog<T> {
    private logDic;
    private logs;
    wrapper: ILazyWrapper;
    constructor(logs: LogEntry<T>[], wrapper: ILazyWrapper);
    getItems(): LogEntry<T>[];
    getMergedVersion(logId: any, recCheck?: any): T;
    _getMergedVersion(logId: any, recCheck?: any): T;
}
export interface LazyValue<T> {
    get(): Promise<T>;
    getCached(loadIfMissing?: boolean, defaultValue?: any): T;
}
export interface IReferenceStore<T> {
    getCached(refVal: any): T;
    getItem(refVal: any, fields?: string[]): Promise<T>;
    loadFieldValue(entityId: any, field: string): Promise<T>;
    saveLoadedFieldOffline(entityId: any, field: string, value: any): Promise<any>;
}
export declare class OfflineDataItem<T> {
    id: string;
    serverValues: T;
    clientValues: T;
    status: EntityStatus;
    isNew: any;
}
export declare class EntityStore<T> implements IReferenceStore<T> {
    _cache: {};
    offlineStore: IOfflineStore<T>;
    onlineStore: IOnlineStore<T>;
    entityWrapCtor: any;
    idField: any;
    merger: EntityMerger;
    type: EntityTypeMeta;
    _allOfflineLoaded: Promise<void>;
    _allOnlineLoaded: Promise<any>;
    logStorage: ILogStorage<T>;
    wrapper: LazyWrapper;
    constructor(offlineStore: IOfflineStore<T>, onlineStore: IOnlineStore<T>, metaProvider: EntityMetaProvider, typeName: any, logStorage: ILogStorage<T>);
    loadFieldValue(entityId: any, field: string): Promise<T>;
    getOrCreate(id: any): Entity<T>;
    saveLoadedFieldOffline(entityId: any, field: any, value: any): Promise<any>;
    isDirty(id: any): boolean;
    merge(currentVals: any, newVals: any): any;
    loadOfflineChanges(): Promise<void>;
    resetChanges(id: any): Promise<T>;
    refreshItem(id: any): Promise<T>;
    addOrUpdate(newValues: T, o?: UpdateOptions): Promise<T>;
    isCreatedOffline(id: any): any;
    queryAll(url: any, params?: any): Promise<T[]>;
    getVersionProp(): EntityPropMeta;
    queryFields(url: any, fields: T): Promise<T[]>;
    query(url: any, params?: any, force?: any): Promise<T[]>;
    import(obj: T): T;
    getAllOfflines(): Promise<T[]>;
    __getAllOfflines(): Promise<void>;
    getCachedOrLoad(id: any): T;
    getCached(id: any): T;
    getItem(id: any, fields?: string[]): Promise<T>;
    getChanges(onlyFinal?: any): Promise<T[]>;
    pushChangesToServer(throwOnError?: any, p?: Progress): Promise<void>;
    preloadItemsArray(ids: any[]): Promise<T[]>;
    getItemsArray(ids: any[], fields?: string[]): Promise<T[]>;
    private log;
}
export declare class EntityMerger {
    private metaProvider;
    constructor(metaProvider: EntityMetaProvider);
    merge(oldVals: any, newVals: any, type: EntityTypeMeta): any;
    private __merge;
}
export declare class EntityMetaProvider {
    private metas;
    stores: {};
    private ctors;
    private lazyCtors;
    constructor(metas: EntityTypeMeta[]);
    addMeta(m: EntityTypeMeta): void;
    getType(typeName: string): EntityTypeMeta;
    getIdField(typeName: any): string;
    regStore<T>(typeName: any, store: IReferenceStore<T>): void;
    getLazyCtor(rootType: any, field: any, realCtor: any, isCollection: any): (v: any, d?: any) => void;
    getEntityCtor(typeName: any): (v: any, d?: any) => void;
    tryGetKeyGetter(itemType: EntityTypeMeta): (o: any) => string;
}
export declare class EntityPropCfg {
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
export declare class EntityTypeMeta {
    props: EntityPropMeta[];
    typeName: string;
    constructor(cfg: EntityTypeCfg);
    getProp(name: string): EntityPropMeta;
}
export declare class EntityPropMeta extends EntityPropCfg {
    constructor(cfg: EntityPropCfg);
    isSimple(): boolean;
}
export declare class LazyHelper {
    static wrap<T>(t: T): LazyValue<T>;
    static unwrap<T>(serverValue: any): T;
}
