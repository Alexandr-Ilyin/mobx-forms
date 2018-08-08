"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cash_dom_1 = require("cash-dom");
const animated_scroll_to_1 = require("animated-scroll-to");
function trim(str, char) {
    if (!str) {
        return str;
    }
    let a = 0, b = str.length;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == char) {
            a++;
        }
        else {
            break;
        }
    }
    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] == char) {
            b--;
        }
        else {
            break;
        }
    }
    return str.substring(a, b);
}
exports.trim = trim;
function addClass(el, className) {
    cash_dom_1.default(el).addClass(className);
}
exports.addClass = addClass;
function removeClass(el, className) {
    cash_dom_1.default(el).removeClass(className);
}
exports.removeClass = removeClass;
function scrollToView(el, parent) {
    animated_scroll_to_1.default(el.offsetLeft, { element: parent, horizontal: true });
}
exports.scrollToView = scrollToView;
function scrollXToEnd(el) {
    if (!el)
        return null;
    animated_scroll_to_1.default(el.scrollWidth, { element: el, horizontal: true });
}
exports.scrollXToEnd = scrollXToEnd;
function getParent(el, className) {
    while (true) {
        if (!el)
            return null;
        let cn = el.className;
        if (typeof (cn) == 'string' &&
            ((cn.indexOf(className + " ") >= 0) || (cn.substring(cn.length - className.length) == className)))
            return el;
        el = el.parentElement;
    }
}
exports.getParent = getParent;
function removeArrayItem(x, items) {
    let index = items.findIndex(i => i === x);
    if (index >= 0) {
        items.splice(index, 1);
    }
}
exports.removeArrayItem = removeArrayItem;
