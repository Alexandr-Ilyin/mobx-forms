"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const basic_1 = require("../forms/basic");
const multiSelect_1 = require("./multiSelect");
const React = require("react");
const core_1 = require("@material-ui/core");
const ui_attr_1 = require("../common/ui-attr");
class MultiSelectField extends basic_1.FormField {
    constructor(parent, cfg) {
        super(parent, cfg);
        this.getOptions = cfg.getOptions;
        this.getOptionByKey = cfg.getOptionByKey;
        this.value = cfg.defaultValue || [];
        this.getKey = cfg.getKey;
        this.getLabel = cfg.getLabel;
    }
    getValueKeys() {
        return this.value.map(x => this.getKey(x));
    }
    setValueKeys(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!keys) {
                keys = [];
            }
            if (keys.length == 0) {
                this.value = [];
                return;
            }
            if (this.getOptionByKey) {
                let v = [];
                let list = keys.map(x => this.getOptionByKey(x).then(z => v.push(z)));
                yield Promise.all(list);
                this.value = v;
            }
            else {
                let options = yield this.getOptions();
                let v = [];
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    let o = options.find(x => this.getKey(x) == key);
                    if (o) {
                        v.push(_.cloneDeep(o));
                    }
                }
                this.value = v;
            }
        });
    }
    isEmpty() {
        return !this.value || this.value.length == 0;
    }
    render() {
        return React.createElement(core_1.FormControl, { fullWidth: true, error: this.visibleError, className: "field-hasError-" + (this.visibleError && true) },
            React.createElement(core_1.InputLabel, null, this.displayName),
            React.createElement(multiSelect_1.MultiSelect, { field: this, classes: {} }));
    }
}
exports.MultiSelectField = MultiSelectField;
class MultiSelectFieldSimple extends MultiSelectField {
    constructor(parent, cfg) {
        super(parent, Object.assign({}, cfg, { getKey: (t) => t.value, getLabel: (t) => t.label }));
    }
}
exports.MultiSelectFieldSimple = MultiSelectFieldSimple;
let MultiSelectFieldStr = class MultiSelectFieldStr extends MultiSelectFieldSimple {
};
MultiSelectFieldStr = __decorate([
    ui_attr_1.cmp
], MultiSelectFieldStr);
exports.MultiSelectFieldStr = MultiSelectFieldStr;
