"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Lazy {
    static wrap(t) {
        return {
            getCached() {
                return t;
            },
            get() {
                return Promise.resolve(t);
            }
        };
    }
    static unwrap(serverValue) {
        if (!serverValue)
            return serverValue;
        if (serverValue.getCached)
            return serverValue.getCached();
        return serverValue;
    }
}
exports.Lazy = Lazy;
function lazy(t) {
    return Lazy.wrap(t);
}
exports.lazy = lazy;
