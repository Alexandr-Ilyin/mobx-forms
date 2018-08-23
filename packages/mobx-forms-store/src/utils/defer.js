"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Defer {
    constructor() {
        this.finished = false;
        this._promise = new Promise((resolve, reject) => {
            this._resolveFunc = resolve;
            this._errorFunc = reject;
            this._tryFinish();
        });
    }
    _tryFinish() {
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
    reject(error) {
        this._fail = { error: error };
        this._tryFinish();
    }
    resolve(res) {
        this._result = { result: res };
        this._tryFinish();
    }
    promise() {
        return this._promise;
    }
}
exports.Defer = Defer;
