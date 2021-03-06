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
const basic_1 = require("../forms/basic");
const ui_attr_1 = require("../common/ui-attr");
const Checkbox_1 = require("@material-ui/core/Checkbox");
const FormControlLabel_1 = require("@material-ui/core/FormControlLabel");
let BoolField = class BoolField extends basic_1.FormField {
    constructor(parent, cfg) {
        if (!cfg.defaultValue)
            cfg.defaultValue = false;
        super(parent, cfg);
    }
    render() {
        return React.createElement(FormControlLabel_1.default, { control: React.createElement(Checkbox_1.default, { checked: this.value, onChange: (e) => { this.value = e.target.checked; }, color: "primary" }), label: this.displayName });
    }
};
BoolField = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object, Object])
], BoolField);
exports.BoolField = BoolField;
