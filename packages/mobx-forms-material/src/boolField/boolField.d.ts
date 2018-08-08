/// <reference types="react" />
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
export declare class BoolField extends FormField<boolean> {
    constructor(parent: IFieldContainer, cfg: FormFieldCfg<boolean>);
    render(): JSX.Element;
}
