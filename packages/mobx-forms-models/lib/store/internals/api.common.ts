
export interface LazyValue<T> {
  get(): Promise<T>
  getCached(loadIfMissing?: boolean, defaultValue?): T
}

export interface ILazyWrapper {
  wrapLazyFields<T>(t: T):T
  unwrapLazyFields<T>(t: T):T;
  getLazyFieldNames():string[]
}

export class LazyHelper {
  static wrap<T>(t: T): LazyValue<T> {
    return {
      getCached() {
        return t;
      },
      get(): Promise<T> {
        return Promise.resolve(t);
      }
    };
  }

  static unwrap<T>(serverValue): T {
    if (!serverValue)
      return serverValue;
    if (serverValue.getCached)
      return serverValue.getCached();
    return serverValue;
  }
}

export function lazy<T>(t: T): LazyValue<T> {
  return LazyHelper.wrap(t);
}