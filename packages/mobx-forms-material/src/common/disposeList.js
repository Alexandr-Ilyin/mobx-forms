"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DisposeList {
    constructor() {
        this.arr = [];
    }
    add(callback) {
        this.arr.push(callback);
    }
    run() {
        this.arr.forEach(x => x());
        this.arr = [];
    }
}
exports.DisposeList = DisposeList;
