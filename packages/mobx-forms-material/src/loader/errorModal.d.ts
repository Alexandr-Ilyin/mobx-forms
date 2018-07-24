/// <reference types="react" />
import { DialogContext, IDialog } from '../modals/dialogService';
export declare function getErrorUi(error: any): any;
export declare class ErrorModal implements IDialog<any> {
    private err;
    constructor(err: any);
    render(ctx: DialogContext<any>): JSX.Element;
}
