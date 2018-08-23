"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runOnce(func, name) {
    return function () {
        let self = this;
        let args = arguments;
        let s = '___loaded_' + name;
        if (self.hasOwnProperty(s)) {
            return self[s];
        }
        return self[s] = func.apply(self, args);
    };
}
function once() {
    return function (target, propertyKey, descriptor) {
        let wrapped = target[propertyKey];
        descriptor.value = target[propertyKey] = runOnce(wrapped, propertyKey);
    };
}
exports.once = once;
