import $ from 'jquery'
import { getData, getStr } from './testContent';
import * as JsTestScreen from "./testScreen";
import getTestDomElement from "./getTestDomElement";
import * as  ReactDOM from  'react-dom';
(window as any).getData = getData;
(window as any).getStr = getStr;

export class TestScreen {
  private screen;
  constructor($el, parent?) {

    this.screen = new JsTestScreen($el, parent, ()=>Promise.resolve({}).then(()=>()=>Promise.resolve({})));
  }
  checkbox(el, v) : Promise<any>{     return this.screen.checkbox(el, v);  }
  click(el): Promise<any>{     return this.screen.click(el);  }
  focus(el): Promise<any>{     return this.screen.focus(el);  }
  checkVisible(el): Promise<any>{     return this.screen.checkVisible(el);  }
  blur(el): Promise<any>{     return this.screen.blur(el);  }
  check(el): Promise<any>{     return this.screen.check(el);  }
  checkVal(el,v): Promise<any>{     return this.screen.checkVal(el,v);  }
  checkFocused(el): Promise<any>{     return this.screen.checkFocused(el);  }
  checkEnabled(el): Promise<any>{     return this.screen.checkEnabled(el);  }
  checkHidden(el): Promise<any>{
    return this.screen.checkHidden(el);  }
  waitFinished() : Promise<any>{
    return this.screen.waitFinished();
  }
}

export async function waitFor(x:()=>boolean, time?){
  if (!time)
    time = 10000;
  let passed = 0;
  while(true){
    if (x())
      return;
    if (passed>time)
      return Promise.reject("Waiting for too long");
    passed+=100;
  }
}

export function renderTestElement(el){
  var dom = getTestDomElement();
  ReactDOM.render(el, dom);
  return dom;
}