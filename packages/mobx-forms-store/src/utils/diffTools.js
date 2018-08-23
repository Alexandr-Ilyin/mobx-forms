"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const diff = require("fast-diff");
function getJsonDiff(source, target) {
    if (source == target) {
        return undefined;
    }
    if (target === undefined) {
        return { __r: 1 };
    }
    if (target === null) {
        return null;
    }
    if (typeof (target) === "string" && target.length < 30 &&
        typeof (source) === "string" && source.length < 30) {
        return target;
    }
    if (source == null) {
        return target;
    }
    if (typeof (source) == "string" && typeof (target) == "string") {
        return { __s: getStrDiff(source, target) };
    }
    if (typeof (source) == "object" && typeof (target) == "object") {
        let r = _.isArray(target) || _.isArray(source) ? [] : {};
        let isEmpty = true;
        for (let t in target) {
            if (!target.hasOwnProperty(t)) {
                continue;
            }
            let n = target[t];
            let o = source[t];
            let jsonDiff = getJsonDiff(o, n);
            if (jsonDiff !== undefined) {
                isEmpty = false;
                r[t] = jsonDiff;
            }
        }
        for (let s in source) {
            if (!source.hasOwnProperty(s)) {
                continue;
            }
            if (!target.hasOwnProperty(s)) {
                r[s] = getJsonDiff(source[s], undefined);
                isEmpty = false;
            }
        }
        if (!isEmpty) {
            return r;
        }
        else {
            return undefined;
        }
    }
    return target;
}
exports.getJsonDiff = getJsonDiff;
function applyJsonDiff(source, diff) {
    if (diff === undefined) {
        return source;
    }
    if (diff == null) {
        return null;
    }
    if (source == null) {
        return diff;
    }
    if (typeof (source) == "string" && diff.__s) {
        return applyStrDiff(source, diff.__s);
    }
    if (typeof (source) == "object" && typeof (diff) == "object") {
        let copy = _.clone(source);
        let clean = false;
        for (let t in diff) {
            if (!diff.hasOwnProperty(t)) {
                continue;
            }
            let n = diff[t];
            let o = source[t];
            let newV = applyJsonDiff(o, n);
            copy[t] = newV;
            if (n && n.__r) {
                if (!_.isArray(copy)) {
                    delete copy[t];
                }
                else {
                    clean = true;
                    copy[t] = n;
                }
            }
        }
        if (clean) {
            copy = copy.filter(x => !x || !x.__r);
        }
        return copy;
    }
    if (diff && diff.__r) {
        return null;
    }
    return diff;
}
exports.applyJsonDiff = applyJsonDiff;
function getStrDiff(source, target) {
    let d = diff(source, target);
    let r = [];
    for (let i = 0; i < d.length; i++) {
        let dx = d[i];
        r[i] = [dx[0], dx[0] == 1 ? dx[1] : null, dx[1].length];
    }
    return r;
}
exports.getStrDiff = getStrDiff;
var DiffType;
(function (DiffType) {
    DiffType[DiffType["noChanges"] = 0] = "noChanges";
    DiffType[DiffType["hasSmallChanges"] = 1] = "hasSmallChanges";
    DiffType[DiffType["removedBigText"] = 2] = "removedBigText";
    DiffType[DiffType["addedBigText"] = 4] = "addedBigText";
})(DiffType = exports.DiffType || (exports.DiffType = {}));
function applyStrDiff(source, patch) {
    let si = 0;
    let parts = [];
    for (let i = 0; i < patch.length; i++) {
        let p = patch[i];
        let len = p[2];
        if (p[0] == 0) {
            parts.push(source.substr(si, len));
            si += len;
        }
        else if (p[0] == 1) {
            parts.push(p[1]);
        }
        else if (p[0] == -1) {
            si += len;
        }
    }
    return parts.join("");
}
exports.applyStrDiff = applyStrDiff;
function checkDiff(diff) {
    let r = DiffType.noChanges;
    function _isBigDiff(diff) {
        if (!diff) {
            return;
        }
        if (typeof (diff) == "string") {
            if (diff.length > 100) {
                r = r | DiffType.hasSmallChanges;
                r = r | DiffType.addedBigText;
            }
            return;
        }
        if (diff.__s) {
            let addedChars = 0;
            let removedChars = 0;
            for (let i = 0; i < diff.__s.length; i++) {
                let change = diff.__s[i];
                if (change[0] == 1) {
                    addedChars += change[2];
                }
                if (change[0] == -1) {
                    removedChars += change[2];
                }
            }
            if (removedChars > 7 || addedChars > 7) {
                r = r | DiffType.hasSmallChanges;
            }
            if (removedChars > 100) {
                r = r | DiffType.removedBigText;
            }
            if (addedChars > 100) {
                r = r | DiffType.addedBigText;
            }
        }
        if (typeof (diff) == "object") {
            for (let t in diff) {
                _isBigDiff(diff[t]);
            }
        }
    }
    _isBigDiff(diff);
    return r;
}
exports.checkDiff = checkDiff;
