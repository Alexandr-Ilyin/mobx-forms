"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUrlParam(url, param) {
    var m = url.match(new RegExp(param + "\=(.*?)(\&|$|#)"));
    return m && decodeURIComponent(m[1]);
}
exports.getUrlParam = getUrlParam;
function setUrlParam(url, param, value) {
    var url = url.replace(/#.*/, "");
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    url = url.replace(new RegExp(param + "\=.*?(\&|$)", "g"), "");
    url = url + sep + param + "=" + encodeURIComponent(value);
    url = url.replace("&&", "&");
    url = url.replace("?&", "?");
    return url;
}
exports.setUrlParam = setUrlParam;
function setHashUrlParam(url, param, value) {
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    url = url.replace(new RegExp(param + "\=.*?(\&|$)", "g"), "");
    url = url + sep + param + "=" + encodeURIComponent(value);
    url = url.replace("&&", "&");
    url = url.replace("?&", "?");
    return url;
}
exports.setHashUrlParam = setHashUrlParam;
