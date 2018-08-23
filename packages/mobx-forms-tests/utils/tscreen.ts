import * as TestUtils from 'react-dom/test-utils';
import * as $ from 'jquery';

export class TScreen {
  $el;
  private selector;
  private parent;

  constructor(selector, parent?) {
    this.selector = selector;
    this.parent = parent;
  }

  async checkbox(s, val: any): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible") && !$el.is(":disabled"));
    TestUtils.Simulate.change($el[0], { target: { value: val, checked: val } } as any);
  }

  async get$my() {
//    await waitAsyncs();
    if (this.$el) {
      return this.$el;
    }
    var p = null;
    if (this.parent) {
      if (this.parent.get$my) {
        p = await
          this.parent.get$my();
      } else {
        p = await wait(this.parent, null);
      }
    }
    this.$el = await wait(this.selector, p);
    return this.$el;
  }

  async keyUp(s: string, key): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));
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
  }

  async keyDown(s: string, key): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));
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
  }

  async focus(s: string): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));
    TestUtils.Simulate.focus($el[0]);
    $el.focus();
  }

  async checkHidden(e: string): Promise<any> {
    var $my = await this.get$my();

    await waitCondition(() => {
      var $el = find(e, $my);
      if ($el.length != 0) {
        return false;
      }

      return $el;
    });

  }

  async click(s: string): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));

    TestUtils.Simulate.mouseDown($el[0]);
    TestUtils.Simulate.click($el[0], { button: 0 });
  }

  async getEl(e: string, checker?): Promise<any> {
    var my = await this.get$my();
    let element = await wait(e, my);
    if (checker) {
      await
        waitCondition(() => {
          return checker(element);
        });
    }
    return element;
  }

  async checkVisible(s: string): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));
  }

  async type(s: string, text: string): Promise<any> {
    var $el = await this.getEl(s, $el => $el.is(":visible"));

    TestUtils.Simulate.focus($el[0]);
    TestUtils.Simulate.change($el[0], { target: { value: text } } as any);
    $el.trigger("change", { target: { value: text } });
  }

}

function waitCondition(condition): Promise<any> {
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

function wait(selector: string, $parent): Promise<any> {
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
  if (typeof(selector) == 'string') {
    if (!selector && $parent) {
      return $parent;
    }

    selector = selector.replace(/~(\w)*/g, (x) => {return "[data-ft='" + x.substring(1) + "']";});
    if (/body/.test(selector) || !$parent) {
      return $(selector);
    } else {
      return $parent.find(selector);
    }
  }

  if (typeof(selector) == 'function') {
    var res = selector($parent);
    if (res) {
      return $(res);
    } else {
      return $([]);
    }
  }
  return selector ? $(selector) : $('body');
}