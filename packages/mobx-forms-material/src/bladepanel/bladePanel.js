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
const react_custom_scrollbars_1 = require("react-custom-scrollbars");
const React = require("react");
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
const ui_attr_1 = require("../common/ui-attr");
const pathMathing_1 = require("./pathMathing");
const utils_1 = require("../common/utils");
const RemoveCircleOutline_1 = require("@material-ui/icons/RemoveCircleOutline");
const Close_1 = require("@material-ui/icons/Close");
const DOM = require("react-dom");
class BladeMatchPanel {
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Boolean)
], BladeMatchPanel.prototype, "collapsed", void 0);
function pushBlade(blade, history) {
    let pathname = history.location.pathname;
    let bladesPath = /\/b\/(.*)\/be\//.exec(pathname);
    if (!bladesPath) {
        return;
    }
    let segments = bladesPath[1].split('/');
    segments.push(utils_1.trim(blade, '/'));
    history.push('/b/' + segments.join('/') + '/be/');
}
exports.pushBlade = pushBlade;
let BladePanel = class BladePanel {
    constructor() {
        this._panels = [];
        this.rules = [];
    }
    get panels() {
        return this._panels;
    }
    addRoute(cfg) {
        let path = cfg.path = "/" + utils_1.trim(cfg.path, "/") + "/";
        cfg.style = Object.assign({ minWidth: "400px", float: 1 }, cfg.style);
        let inner = Object.assign({}, cfg, { match: new pathMathing_1.MatchRule(path) });
        this.rules.push(inner);
    }
    getMatches(path) {
        let bladesPath = /\/b\/(.*)\/be\//.exec(path);
        if (!bladesPath) {
            return [];
        }
        let segments = bladesPath[1].split('/');
        let getMatch = segment => {
            for (let j = 0; j < this.rules.length; j++) {
                const route = this.rules[j];
                let m = route.match.getMatchParams("/" + segment + "/");
                if (m) {
                    return m;
                }
            }
            console.log(new Error("Unknown segment " + segment));
        };
        return segments.map(x => getMatch(x)).filter(x => x);
    }
    connectToHistory(history) {
        history.listen((e) => {
            this.updatePanels(e.pathname);
        });
        this.history = history;
        this.updatePanels(history.location.pathname);
    }
    replace(segment, replaced) {
        let newSegments = [];
        let found = false;
        for (let i = 0; i < this.panels.length; i++) {
            const panel = this.panels[i];
            if (panel.cmp != replaced) {
                newSegments.push(utils_1.trim(panel.segment, "/"));
            }
            else {
                found = true;
                break;
            }
        }
        newSegments.push(segment);
        this.push(newSegments.join("/"));
        if (!found) {
            console.log("after BladePanel not found ", afterCmp);
        }
    }
    pushAfter(segment, afterCmp) {
        let newSegments = [];
        let found = false;
        for (let i = 0; i < this.panels.length; i++) {
            const panel = this.panels[i];
            if (panel.cmp != afterCmp) {
                newSegments.push(utils_1.trim(panel.segment, "/"));
            }
            else {
                found = true;
                newSegments.push(utils_1.trim(panel.segment, "/"));
                break;
            }
        }
        newSegments.push(segment);
        this.push(newSegments.join("/"));
        if (!found) {
            console.log("after BladePanel not found ", afterCmp);
        }
    }
    push(path) {
        let fullPath = "/b/" + utils_1.trim(path, '/') + "/be/";
        if (this.history) {
            this.history.push(fullPath);
        }
        else {
            this.updatePanels(fullPath);
        }
    }
    updatePanels(path) {
        let matches = this.getMatches(path);
        let validCount = 0;
        if (matches.length == 0) {
            let defaultRule = this.rules.find(x => x.isDefault);
            if (defaultRule) {
                matches = this.getMatches('/b/' + utils_1.trim(defaultRule.path, '/') + '/be/');
            }
        }
        for (let i = 0; i < Math.min(matches.length, this._panels.length); i++) {
            const match = matches[i];
            if (this._panels[i].segment == match["segment"]) {
                validCount++;
                if (this._panels[i].cmp['updateParams']) {
                    this._panels[i].cmp['updateParams'](match);
                }
            }
        }
        let numberToPop = this._panels.length - validCount;
        for (let i = 0; i < numberToPop; i++) {
            this._panels.pop();
        }
        for (let i = validCount; i < matches.length; i++) {
            const match = matches[i];
            let rule = this.rules.find(x => x.path == match.path);
            this._panels.push({
                route: rule,
                cmp: rule.makeCmp(match),
                params: match,
                collapsed: false,
                segment: match.segment
            });
        }
    }
    render() {
        return React.createElement("div", { className: "blade-portal" }, this._panels.map(x => React.createElement(PanelUi, { model: x, panel: this })));
    }
    remove(e) {
        let newSegments = [];
        let found = false;
        for (let i = 0; i < this.panels.length; i++) {
            const panel = this.panels[i];
            if (panel != e) {
                newSegments.push(utils_1.trim(panel.segment, "/"));
            }
            else {
                found = true;
                break;
            }
        }
        if (found) {
            this.push(newSegments.join("/"));
        }
    }
};
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], BladePanel.prototype, "_panels", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], BladePanel.prototype, "rules", void 0);
__decorate([
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BladePanel.prototype, "updatePanels", null);
BladePanel = __decorate([
    ui_attr_1.cmp
], BladePanel);
exports.BladePanel = BladePanel;
let PanelUi = class PanelUi extends React.Component {
    componentDidMount() {
        let el = DOM.findDOMNode(this);
        utils_1.scrollXToEnd(utils_1.getParent(el, "blade-portal"));
    }
    render() {
        let x = this.props.model;
        if (x.collapsed) {
            return React.createElement("div", { className: "blade-panel " + "blade-panel-collapsed-" + x.collapsed },
                React.createElement("div", { className: "blade-panel-title", onClick: (e) => {
                        let panel = utils_1.getParent(e.target, "blade-panel");
                        x.collapsed = false;
                        let portal = utils_1.getParent(panel, "blade-portal");
                        setTimeout(() => {
                            utils_1.scrollToView(panel, portal);
                        }, 500);
                    } }, this.getTitle(x)));
        }
        return React.createElement("div", { className: "blade-panel " + "blade-panel-collapsed-" + x.collapsed, style: Object.assign({}, x.cmp['bladeStyle'], x.route.style) },
            React.createElement("div", { className: "blade-panel-title" },
                this.getTitle(x),
                React.createElement("div", { className: "blade-panel-icons" },
                    React.createElement("a", { href: "javascript:;", onClick: (e) => {
                            let parentElement = utils_1.getParent(e.target, "blade-panel");
                            parentElement.style["min-width"] = parentElement.outerWidth;
                            x.collapsed = true;
                            return;
                        } },
                        React.createElement(RemoveCircleOutline_1.default, null)),
                    React.createElement("a", { href: "javascript:;", onClick: (e) => {
                            let parentElement = utils_1.getParent(e.target, "blade-panel");
                            this.props.panel.remove(x);
                        } },
                        React.createElement(Close_1.default, null)))),
            React.createElement("div", { className: "blade-panel-body" },
                React.createElement(react_custom_scrollbars_1.default, null, x.cmp.render())));
    }
    getTitle(x) {
        return (x.cmp["getTitle"] && x.cmp["getTitle"]()) || (x.route.title) || "Untitled";
    }
};
PanelUi = __decorate([
    mobx_react_1.observer
], PanelUi);
