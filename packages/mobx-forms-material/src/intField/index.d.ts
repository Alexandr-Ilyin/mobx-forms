/// <reference types="react" />
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
export declare class IntField extends FormField<number> {
    constructor(parent: IFieldContainer, cfg: FormFieldCfg<number>);
    render(): JSX.Element;
}
