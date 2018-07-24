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
const TestUtils = require("react-dom/test-utils");
const $ = require("jquery");
class TScreen {
    constructor(selector, parent) {
        this.selector = selector;
        this.parent = parent;
    }
    checkbox(s, val) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible") && !$el.is(":disabled"));
            TestUtils.Simulate.change($el[0], { target: { value: val, checked: val } });
        });
    }
    get$my() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$el) {
                return this.$el;
            }
            var p = null;
            if (this.parent) {
                if (this.parent.get$my) {
                    p = yield this.parent.get$my();
                }
                else {
                    p = yield wait(this.parent, null);
                }
            }
            this.$el = yield wait(this.selector, p);
            return this.$el;
        });
    }
    keyUp(s, key) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
            TestUtils.Simulate.keyUp($el[0], {
                key: key,
                keyCode: key,
                which: key
            });
            $el.trigger("keyup", {
                key: key,
                keyCode: key,
                which: key
            });
        });
    }
    keyDown(s, key) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
            TestUtils.Simulate.keyDown($el[0], {
                key: key,
                keyCode: key,
                which: key
            });
            $el.trigger("keydown", {
                key: key,
                keyCode: key,
                which: key
            });
        });
    }
    focus(s) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
            TestUtils.Simulate.focus($el[0]);
            $el.focus();
        });
    }
    checkHidden(e) {
        return __awaiter(this, void 0, void 0, function* () {
            var $my = yield this.get$my();
            yield waitCondition(() => {
                var $el = find(e, $my);
                if ($el.length != 0) {
                    return false;
                }
                return $el;
            });
        });
    }
    click(s) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
            TestUtils.Simulate.mouseDown($el[0]);
            TestUtils.Simulate.click($el[0], { button: 0 });
        });
    }
    getEl(e, checker) {
        return __awaiter(this, void 0, void 0, function* () {
            var my = yield this.get$my();
            let element = yield wait(e, my);
            if (checker) {
                yield waitCondition(() => {
                    return checker(element);
                });
            }
            return element;
        });
    }
    checkVisible(s) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
        });
    }
    type(s, text) {
        return __awaiter(this, void 0, void 0, function* () {
            var $el = yield this.getEl(s, $el => $el.is(":visible"));
            TestUtils.Simulate.focus($el[0]);
            TestUtils.Simulate.change($el[0], { target: { value: text } });
            $el.trigger("change", { target: { value: text } });
        });
    }
}
exports.TScreen = TScreen;
function waitCondition(condition) {
    var r = new Promise((resolve, reject) => {
        var passed = 0;
        var waits = [10, 20, 50, 100, 300, 500, 1000, 2000];
        var currentWaitNum = 0;
        var check = () => {
            var result = condition();
            if (result === false) {
                if (passed < 10000) {
                    var wait = waits[currentWaitNum] || 2000;
                    passed += wait;
                    currentWaitNum++;
                    setTimeout(check, wait);
                }
                else {
                    reject("Too long wait ");
                }
            }
            else {
                resolve(result);
            }
        };
        check();
    });
    return r;
}
function wait(selector, $parent) {
    return waitCondition(() => {
        var $el = find(selector, $parent);
        if ($el.length == 0) {
            return false;
        }
        return $el;
    });
}
function find(selector, $parent) {
    console.log("Find ", selector);
    var x = _find(selector, $parent);
    console.log("Found: " + x.length, x[0]);
    return x;
}
function _find(selector, $parent) {
    if (typeof (selector) == 'string') {
        if (!selector && $parent) {
            return $parent;
        }
        selector = selector.replace(/~(\w)*/g, (x) => { return "[data-ft='" + x.substring(1) + "']"; });
        if (/body/.test(selector) || !$parent) {
            return $(selector);
        }
        else {
            return $parent.find(selector);
        }
    }
    if (typeof (selector) == 'function') {
        var res = selector($parent);
        if (res) {
            return $(res);
        }
        else {
            return $([]);
        }
    }
    return selector ? $(selector) : $('body');
}
