import { EntityStore } from './internals/entityStore';
export interface IOfflineStorageManager {
    waitSaveFinished(): Promise<void>;
    getSavedChangeCount(): number;
    getChangeCount(): number;
    setSaveDelay(v: any): any;
    dispose(): any;
}
export declare function initStores(stores: EntityStore<any>[]): Promise<IOfflineStorageManager>;
