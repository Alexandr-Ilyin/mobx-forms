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
const CircularProgress_1 = require("@material-ui/core/CircularProgress");
const React = require("react");
const mobx_1 = require("mobx");
const ui_attr_1 = require("../common/ui-attr");
const utils_1 = require("../common/utils");
const amim_1 = require("../animation/amim");
class BadgeState {
    constructor(b, n) {
        this.visible = false;
        this.b = b;
        this.num = n;
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], BadgeState.prototype, "visible", void 0);
let LoaderBadge = class LoaderBadge {
    render() {
        return React.createElement(CircularProgress_1.default, { size: 80 });
    }
};
LoaderBadge = __decorate([
    ui_attr_1.cmp
], LoaderBadge);
exports.LoaderBadge = LoaderBadge;
let MessageBadge = class MessageBadge {
    constructor(msg) {
        this.msg = msg;
    }
    render() {
        return React.createElement("div", { className: "msg-badge" }, this.msg);
    }
};
MessageBadge = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object])
], MessageBadge);
exports.MessageBadge = MessageBadge;
let BadgePanel = class BadgePanel {
    constructor() {
        this.badges = [];
        this.badgeNum = 0;
    }
    addMessage(message, p) {
        return this.addBadge(new MessageBadge(message), p);
    }
    addLoading(p) {
        return this.addBadge(new LoaderBadge(), p);
    }
    addBadge(b, p) {
        let badgeState = new BadgeState(b, this.badgeNum++);
        this.badges.push(badgeState);
        let current = this.badges.find(x => x.visible);
        if (!current) {
            badgeState.visible = true;
        }
        let onFinished = () => {
            utils_1.removeArrayItem(badgeState, this.badges);
            let next = this.badges.find(x => x.num >= badgeState.num && !x.visible);
            if (next)
                next.visible = true;
        };
        p.then(onFinished, onFinished);
        return p;
    }
    render(props) {
        props = props || {};
        let visible = this.badges.filter(x => x.visible);
        let showBg = visible.find(x => x.visible);
        return React.createElement("div", { className: "badgePanel" },
            React.createElement("div", { className: "badgePanel-content" }, props.children || null),
            amim_1.fadeIn(showBg && [React.createElement("div", { className: "badgePanel-badges-bg" })]),
            amim_1.fadeIn(visible.map(x => React.createElement("div", { className: "badgePanel-badges", key: x.num },
                React.createElement("div", { className: "badgePanel-badgeItem", key: x.num }, x.b.render())))));
    }
};
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], BadgePanel.prototype, "badges", void 0);
BadgePanel = __decorate([
    ui_attr_1.cmp
], BadgePanel);
exports.BadgePanel = BadgePanel;
