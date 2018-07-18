import $ from 'jquery'

export function getDiffHtml(s1, s2) {
  let diff = (window as any).JsDiff.diffChars(s1, s2) as any,
    display = document.getElementById('display'),
    fragment = document.createDocumentFragment();

  diff.forEach(function(part) {
    let color = part.added ? 'green' :
      part.removed ? 'red' : 'grey';
    let span = document.createElement('span');
    span.style.color = color;
    if (color != 'grey') {
      span.style.fontWeight = 'bold';
      span.style.borderBottom = '1px solid grey';
    }
    span.appendChild(document
      .createTextNode(part.value));
    fragment.appendChild(span);
  });

  let pre = document.createElement("pre");
  pre.appendChild(fragment);

  return "<pre>" + pre.innerHTML + "</pre>";
}
let saveKey = 0;
(window as any).saveFuncs = (window as any).saveFuncs || {};
function clean(text) {
  if (!text) {
    return text;
  }
  text = replaceAll(text, new Date().getFullYear(), '<YEAR>');
  text = replaceAll(text, "\r\n", "\n");
  return text
}

function replaceAll(target, search, replacement) {
  return target.split(search).join(replacement);
}

let checkCounter = 0;
let lastTestName = '';


export function getStr(dom) {
  if (!dom) {
    dom = document.body;
  }
  let str = [];
  let data = getData(dom);
  for (let i = 0; i < data.length; i++) {
    formatData(data[i], s => str.push(s));
  }
  return str.join('\n');
}

export function getData(dom) {
  let result = [];
  addData(dom, result);
  return result;
}

function formatData(data, append) {
  let target = data;
  let str = target.name;
  for (let j = 0; j < target.props.length; j++) {
    let prop = target.props[j];
    str += ", " + prop.name + ":" + prop.value;
  }
  append(str);
  for (let i = 0; i < data.children.length; i++) {
    formatData(data.children[i], (str) => append("  " + str));
  }
}
function getVal(dom, value) {
  if (!value) {
    return value;
  }
  if (value.substr(0, 1) == '.') {
    value = dom[value.substr(1)];
  }
  return value;
}

export function addData(dom, arr) {
  let val = getVal(dom, $(dom).attr('data-ft'));
  if (val) {
    let res: any = { name: val, children: [], props: [] };
    arr.push(res);
    for (let i = 0; i < dom.attributes.length; i++) {
      let attr = dom.attributes[i];
      if (/data-ft-/.test(attr.name)) {
        let value = getVal(dom, attr.value);
        res.props.push({ name: attr.name.substr("data-ft-".length), value: value });
      }
    }
    for (let j = 0; j < dom.childNodes.length; j++) {
      let childNode = dom.childNodes[j];
      addData(childNode, res.children);
    }
    return;
  }
  for (let i = 0; i < dom.childNodes.length; i++) {
    let childNode = dom.childNodes[i];
    if (childNode) {
      addData(childNode, arr);
    }
  }
}
