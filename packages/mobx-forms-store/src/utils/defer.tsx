export class Defer<TResult> {
  private _resolveFunc;
  private _errorFunc;
  private _promise;
  private _fail;
  private _result;
  private finished = false;

  constructor() {
    this._promise = new Promise((resolve: (result: TResult) => void, reject: (error: any) => void) => {
      this._resolveFunc = resolve;
      this._errorFunc = reject;
      this._tryFinish();
    });
  }

  private _tryFinish() {
    if (this.finished) {
      return;
    }
    if (this._result && this._resolveFunc) {
      this.finished = true;
      this._resolveFunc(this._result.result);
    }
    if (this._fail && this._errorFunc) {
      this.finished = true;
      this._errorFunc(this._fail.error);
    }
  }

  reject(error?: any) {
    this._fail = { error: error };
    this._tryFinish();
  }

  resolve(res?: TResult) {
    this._result = { result: res };
    this._tryFinish();
  }

  promise() {
    return this._promise;
  }
}
