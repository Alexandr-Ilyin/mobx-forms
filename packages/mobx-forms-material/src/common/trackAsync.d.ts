export declare function wrapAsync<T>(p: Promise<T>): Promise<T>;
export declare function trackAsync(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
