"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_react_1 = require("mobx-react");
const React = require("react");
let __cmpId = 0;
function cmp(target) {
    let wrapped = target.prototype.render;
    let CMP = class CMP extends React.Component {
        render() {
            return wrapped.apply(this.props.owner, this.props.args);
        }
    };
    CMP = __decorate([
        mobx_react_1.observer
    ], CMP);
    if (target['name'])
        CMP['displayName'] = target['name'];
    target.prototype.render = function () {
        let args = arguments;
        if (this['__cmpId'])
            this['__cmpId'] = 'CMP' + __cmpId++;
        return React.createElement(CMP, { owner: this, args: args, key: this.__cmpId });
    };
}
exports.cmp = cmp;
