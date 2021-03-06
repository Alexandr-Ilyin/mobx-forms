/// <reference types="react" />
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
export declare class StrField extends FormField<string> {
    constructor(parent: IFieldContainer, cfg: FormFieldCfg<string>);
    render(): JSX.Element;
}
