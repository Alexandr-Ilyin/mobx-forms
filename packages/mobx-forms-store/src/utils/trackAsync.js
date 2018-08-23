"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let asyncQueue = Promise.resolve();
function wrapAsync(p) {
    asyncQueue = asyncQueue.then(() => p);
    return p;
}
exports.wrapAsync = wrapAsync;
function runTrackAsync(func) {
    return function () {
        let self = this;
        let args = arguments;
        let r = func.apply(self, args);
        wrapAsync(r);
        return r;
    };
}
function trackAsync() {
    return function (target, propertyKey, descriptor) {
        let wrapped = target[propertyKey];
        descriptor.value = target[propertyKey] = runTrackAsync(wrapped);
    };
}
exports.trackAsync = trackAsync;
