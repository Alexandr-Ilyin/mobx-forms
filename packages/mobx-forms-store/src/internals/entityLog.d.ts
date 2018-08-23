import { ILazyWrapper } from '../utils/lazy';
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
