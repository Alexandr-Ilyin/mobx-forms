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
const TextField_1 = require("@material-ui/core/TextField");
const ui_attr_1 = require("../common/ui-attr");
let DateField = class DateField extends basic_1.FormField {
    constructor(parent, cfg) {
        super(parent, cfg);
    }
    render() {
        return React.createElement(TextField_1.default, { fullWidth: true, type: "date", error: this.visibleError != null, label: this.displayName, value: this.value || "", InputLabelProps: {
                shrink: true,
            }, onChange: (e) => {
                this.touch();
                this.value = e.target.value;
            } });
    }
};
DateField = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object, Object])
], DateField);
exports.DateField = DateField;
