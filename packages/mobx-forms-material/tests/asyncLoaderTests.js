"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("../testRunner/utils/testHelper");
const asyncLoader_1 = require("../src/loader/asyncLoader");
const React = require("react");
const wait_1 = require("../src/common/wait");
describe("Async loader ", function () {
    it("should show loading.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(wait_1.wait(1000));
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", null, "Some content")));
    });
    it("should show error.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(wait_1.wait(1000).then(() => Promise.reject(new Error("Bad.."))));
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", null, "Some content")));
    });
    it("should show content when loading.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(wait_1.wait(100));
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", { style: { minHeight: "400px" } }, "Some content")));
        asyncLoader.wait(new Promise((a, b) => { }));
    });
    it("should show msg when loaded.", function () {
        let asyncLoader = new asyncLoader_1.AsyncLoader();
        asyncLoader.wait(wait_1.wait(1000), "Some message");
        testHelper_1.renderTestElement(asyncLoader.render(React.createElement("div", null, "Some content")));
    });
});
