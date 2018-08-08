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
const React = require("react");
const basic_1 = require("../forms/basic");
const select_1 = require("./select");
const ui_attr_1 = require("../common/ui-attr");
const core_1 = require("@material-ui/core");
const FormControl_1 = require("@material-ui/core/FormControl/FormControl");
let SelectField = class SelectField extends basic_1.FormField {
    constructor(parent, cfg) {
        super(parent, cfg);
        this.getOptions = cfg.getOptions;
        this.getOptionByKey = cfg.getOptionByKey;
        this.getKey = cfg.getKey;
        this.getLabel = cfg.getLabel;
    }
    getValueKey() {
        if (this.value) {
            return this.getKey(this.value);
        }
        return null;
    }
    setValueKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                this.value = null;
                return;
            }
            if (this.getOptionByKey) {
                this.value = yield this.getOptionByKey(key);
            }
            else {
                let options = yield this.getOptions();
                let o = options.find(x => this.getKey(x) == key);
                if (o) {
                    this.value = _.cloneDeep(o);
                    return;
                }
                this.value = null;
                return;
            }
        });
    }
    render() {
        return React.createElement(FormControl_1.default, { fullWidth: true, error: this.visibleError != null, className: "field-hasError-" + (this.visibleError && true) },
            React.createElement(core_1.InputLabel, { shrink: this.getValueKey() != null }, this.displayName),
            React.createElement(select_1.Select, { field: this, classes: {} }));
    }
};
SelectField = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object, Object])
], SelectField);
exports.SelectField = SelectField;
class SelectFieldSimple extends SelectField {
    constructor(parent, cfg) {
        super(parent, Object.assign({}, cfg, { getKey: (t) => t.value, getLabel: (t) => t.label }));
    }
}
exports.SelectFieldSimple = SelectFieldSimple;
let SelectFieldStr = class SelectFieldStr extends SelectFieldSimple {
};
SelectFieldStr = __decorate([
    ui_attr_1.cmp
], SelectFieldStr);
exports.SelectFieldStr = SelectFieldStr;
