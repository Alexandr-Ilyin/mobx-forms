/// <reference types="react" />
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import { SelectValue } from '../forms/selections';
export interface SelectFieldCfg<T extends SelectValue> extends FormFieldCfg<T> {
    getOptions: (query?: string) => Promise<T[]>;
    getOptionByKey?: (key: string) => Promise<T>;
}
export declare class SelectFieldBase<T extends SelectValue> extends FormField<T> {
    getOptionByKey?: (key: string) => Promise<T>;
    getOptions: (query?: string) => Promise<T[]>;
    constructor(parent: IFieldContainer, cfg: SelectFieldCfg<T>);
    optionByKey(getOption: (key: string) => Promise<T>): this;
    setValueKey(key: string): Promise<any>;
}
export declare class SelectField extends SelectFieldBase<SelectValue> {
    render(): JSX.Element;
}
