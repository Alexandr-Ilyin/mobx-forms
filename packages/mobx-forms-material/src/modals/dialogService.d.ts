export declare function closeAllModals(): void;
export declare class DialogService {
    static show<T>(cmp: IDialog<T>): Promise<any>;
}
export interface DialogContext<TResult> {
    cancel: () => void;
    complete(v: TResult): any;
}
export interface IDialog<TResult> {
    render(ctx: DialogContext<TResult>): any;
}
