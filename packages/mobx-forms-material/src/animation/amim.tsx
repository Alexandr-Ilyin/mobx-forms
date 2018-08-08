import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { addClass, removeClass } from '../common/utils';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

class Child {
  el;
  key;
  @observable removed;

  constructor(el, key) {
    this.el = el;
    this.key = key || 'keyNotSet';
  }
}

@observer
class AnimatedItemWrapper extends React.Component<any, any> {
  componentDidMount(): void {
    let domNode = ReactDOM.findDOMNode(this);
    let enterSuffix = this.props.enterSuffix;
    let exitSuffix = this.props.exitSuffix;
    setTimeout(function() {
      if (!domNode) {
        return;
      }
      let currentClassName = domNode.className.split(' ')[0];
      addClass(domNode, currentClassName + "-" + enterSuffix);
      removeClass(domNode, currentClassName + "-" + exitSuffix);
    }, 10);
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    let domNode = ReactDOM.findDOMNode(this);
    let exitSuffix = this.props.exitSuffix;
    let enterSuffix = this.props.enterSuffix;
    console.log("update!");
    setTimeout(() => {
      if (!domNode) {
        return;
      }
      let currentClassName = domNode.className.split(' ')[0];
      console.log("update DOM! r:" + this.props.removed);
      if (this.props.removed) {
        //removeClass(domNode, currentClassName + "-" + enterSuffix);
        addClass(domNode, currentClassName + "-" + exitSuffix);
      } else {
        removeClass(domNode, currentClassName + "-" + exitSuffix);
      }
    }, 10);
  }

  render() {
    return this.props.children;
  }
}

class AnimatedItemsWrapper extends React.Component<any, any> {
  children: Child[] = [];

  constructor(props: any, context: any) {
    super(props, context);
    let newChildren = this.getChildren();
    this.children = newChildren;
    console.log('c!');
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    if (this.propsAreEqual(this.props.children, prevProps.children)) {
      return;
    }
    let newChildren = this.getChildren();
    let isChanged = false;

    let merged = merge(this.children, newChildren, function(x) {
      isChanged = true;
      return x.removed = true;
    }, () => {
      return isChanged = true;
    }, (o, n) => {
      if (o.removed) {
        isChanged = true;
      }
    });

    this.children = merged;
    if (isChanged) {
      this.setState({});
    }
  }

  private getChildren() {
    let c = this.props.children;

    if (c && c['length'] === undefined) {
      c = [c];
    }
    return (c || []).map(x => new Child(x, x.key));
  }

  render() {
    return this.children.map(x => <AnimatedItemWrapper
      exitSuffix={this.props.exitSuffix}
      enterSuffix={this.props.enterSuffix}
      removed={x.removed} key={x.key}>
      {x.el}</AnimatedItemWrapper>);
  }

  private propsAreEqual(c1, c2) {
    c1 = c1 || [];
    c2 = c2 || [];
    if (c1 === c2) {
      return true;
    }
    if (c1.length != c2.length) {
      return false;
    }
    for (let i = 0; i < c1.length; i++) {
      if (c1[i].key != c2[i].key) {
        return false;
      }
    }
    return true;
  }
}

export function fadeIn(els) {
  return <AnimatedItemsWrapper
    enterSuffix={"fadeIn"}
    exitSuffix={"fadeOut"}
  >{els}</AnimatedItemsWrapper>
}

// A B C + B X C => A B X C.... this should be done in O(n) operations!
export function merge(oldArr, newArr, onRemove?, onAdd?, onUpdate?) {
  let x = [];
  let oldKeyIndexes = {};
  for (let i = 0; i < oldArr.length; i++) {
    const o = oldArr[i];
    oldKeyIndexes[o.key] = i;
  }
  let insBef = oldArr.length;
  let insertBefore = [];
  for (let i = newArr.length - 1; i >= 0; i--) {
    let oldKeyIndex = oldKeyIndexes[newArr[i].key];
    if (oldKeyIndex != null) {
      insBef = oldKeyIndex + 1;
      if (onUpdate) {
        onUpdate(oldArr[oldKeyIndex], newArr[i]);
      }
      delete oldKeyIndexes[newArr[i].key];
    }
    else if (onAdd) {
      onAdd(newArr[i]);
    }
    insertBefore[i] = insBef;
  }
  if (onRemove) {
    for (let p in oldKeyIndexes)
      if (oldKeyIndexes.hasOwnProperty(p) && oldKeyIndexes[p] != null) {
        onRemove(oldArr[oldKeyIndexes[p]]);
      }
  }

  let res = [];
  let lastPushedOld = -1;
  for (let i = 0; i < newArr.length; i++) {
    const insBefore = insertBefore[i];
    for (let j = lastPushedOld + 1; j < insBefore; j++) {
      if (oldKeyIndexes[oldArr[j].key] != null) {
        lastPushedOld = j;
        res.push(oldArr[j])
      }
    }
    res.push(newArr[i]);
  }
  for (let i = lastPushedOld + 1; i < oldArr.length; i++) {
    if (oldKeyIndexes[oldArr[i].key] != null) {
      res.push(oldArr[i]);
    }
  }

  return res;
}