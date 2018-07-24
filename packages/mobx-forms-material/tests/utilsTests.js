"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/common/utils");
describe("Utils", function () {
    it("check trim.", function () {
        assert.equal(utils_1.trim("aavaa", "a"), "v");
        assert.equal(utils_1.trim("aav", "a"), "v");
        assert.equal(utils_1.trim("v", "a"), "v");
        assert.equal(utils_1.trim("vaa", "a"), "v");
    });
});
