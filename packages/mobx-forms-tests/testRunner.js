"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = require("jquery");
const navigation_1 = require("./navigation");
const w = window;
w.initMochaRunner = function () {
    w.myTestRunner = new TestRunner();
    w.myTestRunner.initMochaRunner();
};
class TestRunner {
    initMochaRunner() {
        this.initMocha();
        this.initAppendMenu();
        this.initTopMenu();
        this.initErrorHandling();
        mocha.allowUncaught();
    }
    initMocha() {
        mocha.setup({
            ui: 'bdd',
            ignoreLeaks: true,
            timeout: 10000,
        });
        Mocha.Runnable.prototype.fullTitle = function () {
            var prefix = this.parent.fullTitle() ? this.parent.fullTitle() + ';' : '';
            return prefix + this.title;
        };
        var url = window.location.href.replace(/#.*/, "");
        var filterMatch = /filter=([^&]*)/.exec(url);
        var filter = filterMatch ? filterMatch[1] : "";
        var filterRegex = new RegExp("^" + filter.replace(".", "\\.").replace("*", ".*"), "i");
        var skip = navigation_1.getUrlParam(url, "skip");
        var skipTester = {
            test: function (name) {
                return name.indexOf(skip) >= 0;
            }
        };
        window.allTests = [];
        var skipAll = skip ? true : false;
        var testBackup = it;
        window.it = function (name) {
            window.allTests.push(name);
            if (!filterRegex.test(name)) {
                return;
            }
            if (skipAll) {
                if (skipTester.test(name)) {
                    skipAll = false;
                }
                else {
                    return;
                }
            }
            if (navigation_1.getUrlParam(window.location.href, "runTests") !== "1") {
                testBackup.apply(this, [name]);
            }
            else {
                testBackup.apply(this, arguments);
            }
        };
    }
    initTopMenu() {
        const currentUrl = window.location.href;
        const showAllUrl = currentUrl.replace(/\?.*/, "");
        const runAllUrl = navigation_1.setUrlParam(currentUrl, "runTests", "1");
        const showFilteredUrl = navigation_1.setUrlParam(currentUrl, "runTests", "0");
        const menu = jquery_1.default(`<h1><a href='${showAllUrl}'>Show All Tests</a></h1>` +
            `<a href='${runAllUrl}'>Run filtered tests</a>` +
            `<a href='${showFilteredUrl}'>Show filtered tests</a>`);
        jquery_1.default("body").prepend(menu);
    }
    ;
    initAppendMenu() {
        let currentText = "";
        const menu = jquery_1.default("<div style='display: block;  position: absolute; background: white; border: 1px solid gray'>" +
            "<a class='tester-menuItem run'>Only this</a>" +
            "<a class='tester-menuItem restart'>Skip to this</a>" +
            "<a class='tester-menuItem copyName'>Copy name</a>" +
            "</div>");
        menu.hide();
        const $body = jquery_1.default("body");
        $body.append(menu);
        menu.find(".run").click(function () {
            let href = window.location.href;
            href = href.replace(/#.*/, "");
            const path = href.match(/(.*?)(\?|$)/)[1];
            window.location.href = path + "?grep=" + encodeURIComponent(currentText) + "&runTests=" + navigation_1.getUrlParam(href, "runTests");
        });
        menu.find(".copyName").click(function () {
            var testName = currentText.split(";")[1];
            copyToClipboard(testName);
        });
        menu.find(".showScreen").click(function () {
            var path = window.location.href.replace(/runner(?=\.[\w]*)/, "screenDiff");
            path = path.replace(/\?.*/, '');
            window.open(path + "?testName=" + encodeURIComponent(currentText));
        });
        menu.find(".restart").click(function () {
            var testName = currentText.split(";")[1];
            window.location.href = navigation_1.setUrlParam(window.location.href, "skip", testName) + "&runTests=" + navigation_1.getUrlParam(window.location.href, "runTests");
        });
        jquery_1.default("html").click(function () {
            menu.hide();
        });
        $body.on({
            "mouseenter": function (e) {
                const pos = jquery_1.default(e.target).offset();
                let nodeValue = e.target.childNodes[0].nodeValue;
                if (/\d+ms/.test(nodeValue)) {
                    return;
                }
                currentText = nodeValue;
                const suiteText = jquery_1.default(e.target).closest(".suite").find("H1 A").text();
                if (suiteText) {
                    currentText = suiteText + ";" + currentText;
                }
                currentText = currentText.trim();
                menu.css({ top: pos.top + jquery_1.default(e.target).height() - 30, left: 300 });
                menu.show();
            }
        }, "li.test h2");
    }
    initErrorHandling() {
        if (window.addEventListener) {
            window.addEventListener("unhandledrejection", function (e) {
                e.preventDefault();
                let err = e;
                console.log(err.detail);
                console.log(err.detail && err.detail.reason && err.detail.reason.stack);
            });
            window.addEventListener("rejectionhandled", function (e) {
                e.preventDefault();
            });
        }
    }
}
exports.TestRunner = TestRunner;
function copyToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    }
    catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}
