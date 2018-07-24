"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("../testRunner/utils/testHelper");
const asyncLoader_1 = require("../src/loader/asyncLoader");
const entityStore_1 = require("../src/store/internals/entityStore");
const React = require("react");
describe("Async loader ", function () {
    it("should show loading.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(() => entityStore_1.wait(1000));
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", null, "Some content")));
    });
    it("should show error.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(() => entityStore_1.wait(1000).then(() => Promise.reject(new Error("Bad.."))));
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", null, "Some content")));
    });
});
