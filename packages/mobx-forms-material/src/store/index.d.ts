import { IStoreConfiguration } from './interfaces';
export interface IStoreInstance {
    dispose(): any;
}
export declare function initStores(cfg: IStoreConfiguration): Promise<IStoreInstance>;
