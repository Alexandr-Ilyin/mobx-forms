export declare class Defer<TResult> {
    private _resolveFunc;
    private _errorFunc;
    private _promise;
    private _fail;
    private _result;
    private finished;
    constructor();
    private _tryFinish;
    reject(error?: any): void;
    resolve(res?: TResult): void;
    promise(): any;
}
