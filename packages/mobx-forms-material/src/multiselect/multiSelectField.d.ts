/// <reference types="react" />
import { SelectValue } from '../forms/selections';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
export interface MultiSelectFieldCfg<TKey, T> extends FormFieldCfg<T[]> {
    getOptions: (query?: string) => Promise<T[]>;
    getOptionByKey?: (key: TKey) => Promise<T>;
    getKey: (t: T) => TKey;
    getLabel: (t: T) => string;
}
export declare class MultiSelectField<TKey, T> extends FormField<T[]> {
    getOptionByKey?: (key: TKey) => Promise<T>;
    getOptions: (query?: string) => Promise<T[]>;
    getKey: (t: T) => TKey;
    getLabel: (t: T) => string;
    constructor(parent: IFieldContainer, cfg: MultiSelectFieldCfg<TKey, T>);
    getValueKeys(): TKey[];
    setValueKeys(keys: TKey[]): Promise<any>;
    isEmpty(): boolean;
    render(): JSX.Element;
}
export interface MultiSelectFieldSimpleCfg<TKey> extends FormFieldCfg<SelectValue<TKey>[]> {
    getOptions: (query?: string) => Promise<SelectValue<TKey>[]>;
    getOptionByKey?: (key: TKey) => Promise<SelectValue<TKey>>;
}
export declare class MultiSelectFieldSimple<TKey> extends MultiSelectField<TKey, SelectValue<TKey>> {
    constructor(parent: IFieldContainer, cfg: MultiSelectFieldSimpleCfg<TKey>);
}
export declare class MultiSelectFieldStr extends MultiSelectFieldSimple<string> {
}
