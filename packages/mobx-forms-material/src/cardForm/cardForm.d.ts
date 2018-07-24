/// <reference types="react" />
import { FormBase, IFieldContainer, IFormField } from '../forms/basic';
import { AsyncLoader } from '../loader/asyncLoader';
export declare abstract class CardForm extends FormBase implements IFormField, IFieldContainer {
    loader: AsyncLoader;
    constructor(parent: IFieldContainer);
    protected init(): Promise<any>;
    renderHeader(): any;
    abstract renderBody(): any;
    renderActions(): any;
    render(): JSX.Element;
}
