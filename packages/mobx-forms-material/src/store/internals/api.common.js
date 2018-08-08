"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LazyHelper {
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
exports.LazyHelper = LazyHelper;
function lazy(t) {
    return LazyHelper.wrap(t);
}
exports.lazy = lazy;
