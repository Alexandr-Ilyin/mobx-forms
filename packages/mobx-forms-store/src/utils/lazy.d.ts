export interface LazyValue<T> {
    get(): Promise<T>;
    getCached(loadIfMissing?: boolean, defaultValue?: any): T;
}
export declare class Lazy {
    static wrap<T>(t: T): LazyValue<T>;
    static unwrap<T>(serverValue: any): T;
}
export interface ILazyWrapper {
    wrapLazyFields<T>(t: T): T;
    unwrapLazyFields<T>(t: T): T;
    getLazyFieldNames(): string[];
}
export interface LazyValue<T> {
    get(): Promise<T>;
    getCached(loadIfMissing?: boolean, defaultValue?: any): T;
}
export interface ILazyWrapper {
    wrapLazyFields<T>(t: T): T;
    unwrapLazyFields<T>(t: T): T;
    getLazyFieldNames(): string[];
}
export declare function lazy<T>(t: T): LazyValue<T>;
