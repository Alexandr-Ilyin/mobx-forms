"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toDict(arr, f) {
    let hashSet = {};
    for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        hashSet[f(obj)] = obj;
    }
    return hashSet;
}
exports.toDict = toDict;
