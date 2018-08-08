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
const Drawer_1 = require("@material-ui/core/Drawer");
const List_1 = require("@material-ui/core/List");
const Typography_1 = require("@material-ui/core/Typography");
const core_1 = require("@material-ui/core");
const mobx_1 = require("mobx");
const bladePanel_1 = require("../bladepanel/bladePanel");
const utils_1 = require("../common/utils");
class AppMenuItem {
    constructor(text, icon, route, parent) {
        this.text = text;
        this.icon = icon;
        this.route = route;
        this.parent = parent;
    }
    render() {
        let style = {};
        if (this.parent.bladePanel.panels.length > 0 &&
            utils_1.trim(this.parent.bladePanel.panels[0].route.path, '/') === utils_1.trim(this.route, '/'))
            style = { background: "white" };
        return React.createElement(core_1.ListItem, { style: style, button: true, onClick: () => {
                this.parent.bladePanel.push(this.route);
            }, className: "app-layout-menuItem" },
            React.createElement(core_1.ListItemIcon, null, this.icon),
            React.createElement(core_1.ListItemText, { primary: this.text }));
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], AppMenuItem.prototype, "isSelected", void 0);
exports.AppMenuItem = AppMenuItem;
class BladeAppLayout {
    constructor() {
        this.menuItems = [];
        this.bladePanel = new bladePanel_1.BladePanel();
    }
    addItem(text, icon, route) {
        this.menuItems.push(new AppMenuItem(text, icon, route, this));
    }
    render() {
        return React.createElement("div", null,
            React.createElement("div", { className: "app-layout-appBar" },
                React.createElement(Typography_1.default, { variant: "headline", gutterBottom: true, style: { color: 'white', padding: "15px 27px" } }, "People core")),
            React.createElement(Drawer_1.default, { className: "app-layout-drawer", variant: "permanent" },
                React.createElement(List_1.default, null, this.menuItems.map(x => x.render()))),
            React.createElement("div", { className: "app-layout-blades" }, this.bladePanel.render()));
    }
}
exports.BladeAppLayout = BladeAppLayout;
