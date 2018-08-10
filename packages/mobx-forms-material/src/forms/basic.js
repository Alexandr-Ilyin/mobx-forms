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
var _a;
const mobx_1 = require("mobx");
const utils_1 = require("../common/utils");
const validators_1 = require("./validators");
class FormBase {
    constructor(parent) {
        this.fields = [];
        if (parent) {
            parent.addField(this);
        }
    }
    removeField(field) {
        utils_1.removeArrayItem(field, this.fields);
    }
    addField(field) {
        this.fields.push(field);
    }
    isValid() {
        return this.fields.find(x => !x.isValid()) == null;
    }
    touch() {
        this.fields.forEach(x => x.touch());
    }
    validate() {
        this.touch();
        return this.isValid();
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], FormBase.prototype, "fields", void 0);
exports.FormBase = FormBase;
class ArrayField {
    constructor(parent) {
        this.items = [];
        parent.fields.push(this);
    }
    add(field) {
        this.items.push(field);
    }
    isValid() {
        return this.items.find(x => !x.isValid()) == null;
    }
    touch() {
        this.items.forEach(x => x.touch());
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], ArrayField.prototype, "items", void 0);
exports.ArrayField = ArrayField;
class FormField {
    constructor(parent, cfg) {
        this.validators = [];
        this.displayName = name;
        if (parent) {
            parent.addField(this);
        }
        this.validators = cfg.validations || [];
        if (cfg.required)
            this.validators.push(validators_1.Validation.required());
        this.displayName = cfg.displayName || "";
        this.value = cfg.defaultValue;
    }
    getValue() {
        return this.value;
    }
    setValue(vals) {
        this.value = vals;
    }
    touch() {
        this.touched = true;
    }
    isValid() {
        return this.error == null;
    }
    get error() {
        for (let i = 0; i < this.validators.length; i++) {
            const err = this.validators[i](this.value, this);
            if (err) {
                return err;
            }
        }
        return null;
    }
    get visibleError() {
        if (this.touched) {
            return this.error;
        }
        return null;
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], FormField.prototype, "validators", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", typeof (_a = typeof T !== "undefined" && T) === "function" && _a || Object)
], FormField.prototype, "value", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", String)
], FormField.prototype, "displayName", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], FormField.prototype, "touched", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], FormField.prototype, "loading", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], FormField.prototype, "B", void 0);
__decorate([
    mobx_1.computed,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], FormField.prototype, "error", null);
__decorate([
    mobx_1.computed,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], FormField.prototype, "visibleError", null);
exports.FormField = FormField;
