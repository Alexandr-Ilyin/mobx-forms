/// <reference types="react" />
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import { SelectValue } from '../forms/selections';
import { SelectFieldCfg } from './selectField';
export interface SelectFieldCfg<TKey, T> extends FormFieldCfg<T> {
    getOptions?: (query?: string) => Promise<T[]>;
    getOptionByKey?: (key: TKey) => Promise<T>;
    getKey?: (t: T) => TKey;
    getLabel?: (t: T) => string;
}
export declare class SelectField<TKey, T> extends FormField<T> {
    getOptions: (query?: string) => Promise<T[]>;
    getKey: (t: T) => TKey;
    getLabel: (t: T) => string;
    getOptionByKey?: (key: TKey) => Promise<T>;
    constructor(parent: IFieldContainer, cfg: SelectFieldCfg<TKey, T>);
    getValueKey(): TKey;
    setValueKey(key: TKey): Promise<any>;
    render(): JSX.Element;
}
export interface SelectFieldSimpleCfg<TKey> extends FormFieldCfg<SelectValue<TKey>> {
    getOptions: (query?: string) => Promise<SelectValue<TKey>[]>;
    getOptionByKey?: (key: TKey) => Promise<SelectValue<TKey>>;
}
export declare class SelectFieldSimple<TKey> extends SelectField<TKey, SelectValue<TKey>> {
    constructor(parent: IFieldContainer, cfg: SelectFieldSimpleCfg<TKey>);
}
export declare class SelectFieldStr extends SelectFieldSimple<string> {
}
