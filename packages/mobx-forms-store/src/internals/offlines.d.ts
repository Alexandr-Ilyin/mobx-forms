import { Progress } from '../utils/progress';
import { Queue } from '../utils/queue';
export declare function emualtedOffline(): boolean;
export declare function startOfflineMonitoring(): void;
export declare function setRealOnline(): void;
export declare function isOffline(): boolean;
export declare function setOnline(v?: boolean): void;
export declare function setOffline(v?: boolean): void;
export declare function retryOffline<T>(func: any): () => any;
export declare function getOfflineError(url?: any): any;
export declare function isOnline(): boolean;
export declare function offlineRetry(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
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
