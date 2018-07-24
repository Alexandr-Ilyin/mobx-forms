export interface LazyValue<T> {
    get(): Promise<T>;
    getCached(loadIfMissing?: boolean, defaultValue?: any): T;
}
export interface ILazyWrapper {
    wrapLazyFields<T>(t: T): T;
    unwrapLazyFields<T>(t: T): T;
    getLazyFieldNames(): string[];
}
export declare class LazyHelper {
    static wrap<T>(t: T): LazyValue<T>;
    static unwrap<T>(serverValue: any): T;
}
export declare function lazy<T>(t: T): LazyValue<T>;
