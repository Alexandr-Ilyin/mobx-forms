"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defer_1 = require("./defer");
function wait(time) {
    var defer = new defer_1.Defer();
    setTimeout(function () {
        defer.resolve();
    }, time);
    return defer.promise();
}
exports.wait = wait;
