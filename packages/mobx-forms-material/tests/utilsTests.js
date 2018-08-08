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
const React = require("react");
const utils_1 = require("../src/common/utils");
const asyncLoader_1 = require("../src/loader/asyncLoader");
const entityStore_1 = require("../src/store/internals/entityStore");
const badgePanel_1 = require("../src/badgePanel/badgePanel");
const testHelper_1 = require("../testRunner/utils/testHelper");
const assert = require("assert");
describe("Utils", function () {
    it("check trim.", function () {
        assert.equal(utils_1.trim("aavaa", "a"), "v");
        assert.equal(utils_1.trim("aav", "a"), "v");
        assert.equal(utils_1.trim("v", "a"), "v");
        assert.equal(utils_1.trim("vaa", "a"), "v");
    });
    it("check badge panel.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let b = new badgePanel_1.BadgePanel();
            testHelper_1.renderTestElement(b.render({ children: React.createElement("div", { style: { 'height': '300px' } }, "Some content") }));
            yield entityStore_1.wait(1000);
            console.log("load...");
            yield b.addLoading(entityStore_1.wait(2000));
            yield b.addMessage("SAVED", entityStore_1.wait(2000));
            yield b.addLoading(entityStore_1.wait(2000));
            yield b.addMessage("SAVED", entityStore_1.wait(2000));
            console.log("load #2...");
            console.log("finished...");
        });
    });
    it("check loader.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let a = new asyncLoader_1.AsyncLoader();
            yield a.wait(() => entityStore_1.wait(100));
            a.wait(() => Promise.reject(new Error("Test error"))).then(() => { }, () => { });
            yield a.wait(() => entityStore_1.wait(100));
            yield a.wait(() => entityStore_1.wait(100));
        });
    });
});
