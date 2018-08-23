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
const testContent_1 = require("./testContent");
const JsTestScreen = require("./testScreen");
const getTestDomElement_1 = require("./getTestDomElement");
const ReactDOM = require("react-dom");
window.getData = testContent_1.getData;
window.getStr = testContent_1.getStr;
class TestScreen {
    constructor($el, parent) {
        this.screen = new JsTestScreen($el, parent, () => Promise.resolve({}).then(() => () => Promise.resolve({})));
    }
    checkbox(el, v) { return this.screen.checkbox(el, v); }
    click(el) { return this.screen.click(el); }
    focus(el) { return this.screen.focus(el); }
    checkVisible(el) { return this.screen.checkVisible(el); }
    blur(el) { return this.screen.blur(el); }
    check(el) { return this.screen.check(el); }
    checkVal(el, v) { return this.screen.checkVal(el, v); }
    checkFocused(el) { return this.screen.checkFocused(el); }
    checkEnabled(el) { return this.screen.checkEnabled(el); }
    checkHidden(el) {
        return this.screen.checkHidden(el);
    }
    waitFinished() {
        return this.screen.waitFinished();
    }
}
exports.TestScreen = TestScreen;
function waitFor(x, time) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!time)
            time = 10000;
        let passed = 0;
        while (true) {
            if (x())
                return;
            if (passed > time)
                return Promise.reject("Waiting for too long");
            passed += 100;
        }
    });
}
exports.waitFor = waitFor;
function renderTestElement(el) {
    var dom = getTestDomElement_1.default();
    ReactDOM.render(el, dom);
    return dom;
}
exports.renderTestElement = renderTestElement;
