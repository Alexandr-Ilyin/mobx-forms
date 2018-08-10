"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const utils_1 = require("../common/utils");
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
class Child {
    constructor(el, key) {
        this.el = el;
        this.key = key || 'keyNotSet';
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], Child.prototype, "removed", void 0);
let AnimatedItemWrapper = class AnimatedItemWrapper extends React.Component {
    componentDidMount() {
        let domNode = ReactDOM.findDOMNode(this);
        let enterSuffix = this.props.enterSuffix;
        let exitSuffix = this.props.exitSuffix;
        setTimeout(function () {
            if (!domNode) {
                return;
            }
            let currentClassName = domNode.className.split(' ')[0];
            utils_1.addClass(domNode, currentClassName + "-" + enterSuffix);
            utils_1.removeClass(domNode, currentClassName + "-" + exitSuffix);
        }, 10);
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        let domNode = ReactDOM.findDOMNode(this);
        let exitSuffix = this.props.exitSuffix;
        let enterSuffix = this.props.enterSuffix;
        console.log("update!");
        setTimeout(() => {
            if (!domNode) {
                return;
            }
            let currentClassName = domNode.className.split(' ')[0];
            if (this.props.removed) {
                utils_1.addClass(domNode, currentClassName + "-" + exitSuffix);
            }
            else {
                utils_1.removeClass(domNode, currentClassName + "-" + exitSuffix);
            }
        }, 10);
    }
    render() {
        return this.props.children;
    }
};
AnimatedItemWrapper = __decorate([
    mobx_react_1.observer
], AnimatedItemWrapper);
class AnimatedItemsWrapper extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.children = [];
        let newChildren = this.getChildren();
        this.children = newChildren;
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.propsAreEqual(this.props.children, prevProps.children)) {
            return;
        }
        let newChildren = this.getChildren();
        let isChanged = false;
        let merged = merge(this.children, newChildren, (x) => {
            isChanged = true;
            x.removed = true;
            setTimeout(() => { utils_1.removeArrayItem(x, this.children); }, 1500);
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
    getChildren() {
        let c = this.props.children;
        if (c && c['length'] === undefined) {
            c = [c];
        }
        return (c || []).map(x => new Child(x, x.key));
    }
    render() {
        return this.children.map(x => React.createElement(AnimatedItemWrapper, { exitSuffix: this.props.exitSuffix, enterSuffix: this.props.enterSuffix, removed: x.removed, key: x.key }, x.el));
    }
    propsAreEqual(c1, c2) {
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
function fadeIn(els) {
    return React.createElement(AnimatedItemsWrapper, { enterSuffix: "fadeIn", exitSuffix: "fadeOut" }, els);
}
exports.fadeIn = fadeIn;
function merge(oldArr, newArr, onRemove, onAdd, onUpdate) {
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
                res.push(oldArr[j]);
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
exports.merge = merge;
