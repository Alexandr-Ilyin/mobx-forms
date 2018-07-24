/// <reference types="react" />
import { SelectValue } from '../forms/selections';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
export interface MultiSelectFieldCfg<T extends SelectValue> extends FormFieldCfg<T[]> {
    getOptions: (query?: string) => Promise<T[]>;
    getOptionByKey?: (key: string) => Promise<T>;
}
export declare class MultiSelectFieldBase<T extends SelectValue> extends FormField<T[]> {
    getOptionByKey?: (key: string) => Promise<T>;
    getOptions: (query?: string) => Promise<T[]>;
    constructor(parent: IFieldContainer, cfg: MultiSelectFieldCfg<T>);
    optionByKey(getOption: (key: string) => Promise<T>): this;
    setValueKeys(keys: string[]): Promise<any>;
    isEmpty(): boolean;
    render(): JSX.Element;
}
export declare class MultiSelectField extends MultiSelectFieldBase<SelectValue> {
}
