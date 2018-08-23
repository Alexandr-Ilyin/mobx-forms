"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let isReached;
function isQuotaReached() {
    return isReached;
}
exports.isQuotaReached = isQuotaReached;
function _isQuotaReached() {
    let n = navigator;
    if (n.webkitTemporaryStorage && n.webkitTemporaryStorage.queryUsageAndQuota) {
        return new Promise((resolve, reject) => {
            n.webkitTemporaryStorage.queryUsageAndQuota(function (usedBytes, grantedBytes) {
                resolve(usedBytes == grantedBytes);
            }, function (e) {
                console.log("error", e);
                resolve(false);
            });
        });
    }
}
;
function calcQuotaReached() {
    return __awaiter(this, void 0, void 0, function* () {
        isReached = yield _isQuotaReached();
        return isReached;
    });
}
exports.calcQuotaReached = calcQuotaReached;
