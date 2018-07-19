import $ from "jquery";
import { setUrlParam, getUrlParam } from "./navigation";
const w = window as any;
w.initMochaRunner = function () {
  w.myTestRunner = new TestRunner();
  w.myTestRunner.initMochaRunner();
};

export class TestRunner {

  initMochaRunner() {
    this.initMocha();
    this.initAppendMenu();
    this.initTopMenu();
    this.initErrorHandling();
    (mocha as any).allowUncaught();

  }

  private initMocha() {
    mocha.setup({
      ui: 'bdd',
      ignoreLeaks: true,
      timeout: 10000,
      // bail: true
    });
    (Mocha as any).Runnable.prototype.fullTitle = function () {
      var prefix = this.parent.fullTitle() ? this.parent.fullTitle() + ';' : '';
      return prefix + this.title;
    };
    // SHARED
    var url = window.location.href.replace(/#.*/, "");
    var filterMatch = /filter=([^&]*)/.exec(url);
    var filter = filterMatch ? filterMatch[1] : "";
    var filterRegex = new RegExp("^" + filter.replace(".", "\\.").replace("*", ".*"), "i");
    var skip = getUrlParam(url, "skip");
    var skipTester = {
      test: function (name) {
        return name.indexOf(skip) >= 0;
      }
    };
    (window as any).allTests = [];
    var skipAll = skip ? true : false;
    var testBackup = it;
    (window as any).it = function (name) {
      (window as any).allTests.push(name);
      if (!filterRegex.test(name)) {
        return;
      }
      if (skipAll) {
        if (skipTester.test(name)) {
          skipAll = false;
        } else {
          return;
        }
      }
      if (getUrlParam(window.location.href, "runTests") !== "1") {
        testBackup.apply(this, [name]);
      } else {
        testBackup.apply(this, arguments);
      }
    };
  }

  private initTopMenu() {
    const currentUrl = window.location.href;
    const showAllUrl = currentUrl.replace(/\?.*/, "");
    const runAllUrl = setUrlParam(currentUrl, "runTests", "1");
    const showFilteredUrl = setUrlParam(currentUrl, "runTests", "0");
    const menu = $(`<h1><a href='${showAllUrl}'>Show All Tests</a></h1>` +
      `<a href='${runAllUrl}'>Run filtered tests</a>` +
      `<a href='${showFilteredUrl}'>Show filtered tests</a>`);
    $("body").prepend(menu);
  };

  private initAppendMenu() {
    // CONTEXT MENU
    let currentText = "";
    const menu = $("<div style='display: block;  position: absolute; background: white; border: 1px solid gray'>" +
      "<a class='tester-menuItem run'>Only this</a>" +
      "<a class='tester-menuItem restart'>Skip to this</a>" +
      "<a class='tester-menuItem copyName'>Copy name</a>" +
      "</div>");

    menu.hide();
    const $body = $("body");

    $body.append(menu);
    menu.find(".run").click(function () {

      let href = window.location.href;
      href = href.replace(/#.*/,"");
      const path = href.match(/(.*?)(\?|$)/)[1];
      window.location.href = path + "?grep=" + encodeURIComponent(currentText) + "&runTests=" + getUrlParam(href, "runTests");
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

      window.location.href = setUrlParam(window.location.href, "skip", testName) + "&runTests=" + getUrlParam(window.location.href, "runTests");
    });

    $("html").click(function () {
      menu.hide()
    });

    $body.on({
      "mouseenter": function (e) {

        const pos = $(e.target).offset();
        let nodeValue = e.target.childNodes[0].nodeValue;
        if (/\d+ms/.test(nodeValue)) {
          return;
        }

        currentText = nodeValue;

        const suiteText = $(e.target).closest(".suite").find("H1 A").text();
        if (suiteText) {
          currentText = suiteText + ";" + currentText;
        }
        currentText = currentText.trim();
        menu.css({top: pos.top + $(e.target).height() - 30, left: 300});
        menu.show();
      }
    }, "li.test h2");
  }

  private initErrorHandling() {
    // Handle errors
    if (window.addEventListener) {
      window.addEventListener("unhandledrejection", function (e) {
        e.preventDefault();
        let err = (e as any);
        console.log(err.detail)
        console.log(err.detail && err.detail.reason && err.detail.reason.stack)
      });

      window.addEventListener("rejectionhandled", function (e) {
        e.preventDefault();
      });
    }
  }
}

function copyToClipboard(text) {
  var textArea = document.createElement("textarea") as any;

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}
