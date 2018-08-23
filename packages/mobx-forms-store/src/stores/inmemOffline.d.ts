import { IOfflineStore, OfflineDataItem } from '../interfaces';
export declare class InMemoryOffline<T> implements IOfflineStore<T> {
    items: {};
    getAllChanges(): Promise<OfflineDataItem<T>[]>;
    getAll(): Promise<OfflineDataItem<T>[]>;
    find(id: any): Promise<OfflineDataItem<T>>;
    set(id: any, t: OfflineDataItem<T>): Promise<void>;
    isPersistent(): boolean;
    initialize(typeName: any, metaProvider: any): void;
}
