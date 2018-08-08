"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.promise = Promise.resolve();
        this.length = 0;
    }
    enqueue(p) {
        let result = this.promise.then(() => p(), () => p());
        this.length++;
        this.promise = result.then(() => {
            this.length--;
        }, () => {
            this.length--;
        });
        return result;
    }
    makeQueued(func) {
        let s = this;
        return function () {
            let args = arguments;
            let self = this;
            return s.enqueue(() => func.apply(self, args));
        };
    }
    isEmpty() {
        return this.length === 0;
    }
}
exports.Queue = Queue;
