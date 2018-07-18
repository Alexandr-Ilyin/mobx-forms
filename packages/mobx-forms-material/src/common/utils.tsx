import $ from "cash-dom";
import animateScrollTo from 'animated-scroll-to';

export function trim(str, char) {
  if (!str) {
    return str;
  }

  let a = 0, b = str.length;
  for (let i = 0; i < str.length; i++) {
    if (str[i] == char) {
      a++;
    } else {
      break;
    }
  }
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] == char) {
      b--;
    } else {
      break;
    }
  }
  return str.substring(a, b);
}

export function addClass(el, className){
  $(el).addClass(className);
}

export function removeClass(el, className){
  $(el).removeClass(className);
}

export function scrollToView(el, parent){

  animateScrollTo(el.offsetLeft, {element:parent,horizontal:true});
}
export function scrollXToEnd(el){
  if (!el)
    return null;
  animateScrollTo(el.scrollWidth, {element:el,horizontal:true});
}
export function getParent(el, className){
  while (true) {
    if (!el)
      return null;

    let cn = el.className;
    if (typeof (cn)=='string' &&
      ((cn.indexOf(className+" ") >= 0)||(cn.substring(cn.length-className.length)==className)))
      return el;
    el = el.parentElement;
  }
}

export function removeArrayItem<T>(x: T, items: T[]) {
  let index = items.findIndex(i => i === x);
  if (index >= 0) {
    items.splice(index, 1);
  }

}
