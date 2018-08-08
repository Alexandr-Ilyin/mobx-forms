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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const PropTypes = require("prop-types");
const react_select_1 = require("react-select");
const mobx_react_1 = require("mobx-react");
const Chip_1 = require("@material-ui/core/Chip");
const Typography_1 = require("@material-ui/core/Typography");
const ArrowDropDown_1 = require("@material-ui/icons/ArrowDropDown");
const Cancel_1 = require("@material-ui/icons/Cancel");
const ArrowDropUp_1 = require("@material-ui/icons/ArrowDropUp");
const Clear_1 = require("@material-ui/icons/Clear");
const Input_1 = require("@material-ui/core/Input");
const styles_1 = require("@material-ui/core/styles");
const styles_2 = require("./styles");
const MenuItem_1 = require("@material-ui/core/MenuItem");
class Option extends React.Component {
    constructor() {
        super(...arguments);
        this.handleClick = event => {
            this.props.onSelect(this.props.option, event);
        };
    }
    render() {
        const { children, isFocused, isSelected, onFocus } = this.props;
        return (React.createElement(MenuItem_1.default, { onFocus: onFocus, selected: isFocused, onClick: this.handleClick, component: "div", style: {
                fontWeight: isSelected ? 500 : 400,
            } }, children));
    }
}
let SelectWrapped = class SelectWrapped extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.muiFormControl = props.muiFormControl || context.muiFormControl;
    }
    componentDidMount() {
        this.updateDirty();
    }
    updateDirty() {
        if (this.muiFormControl) {
            if (this.props.field.getValue()) {
                this.muiFormControl.onFilled();
            }
            else {
                this.muiFormControl.onEmpty();
            }
        }
    }
    render() {
        let props = this.props;
        const { classes } = props, other = __rest(props, ["classes"]);
        let renderValue = (valueProps) => {
            {
                const { value, children, onRemove } = valueProps;
                const onDelete = event => {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemove(value);
                };
                if (onRemove) {
                    return (React.createElement(Chip_1.default, { tabIndex: -1, label: children, className: classes.chip, deleteIcon: React.createElement(Cancel_1.default, { className: "Select-value-icon", onTouchEnd: onDelete, onMouseDown: onDelete }), onDelete: onDelete }));
                }
                return React.createElement("div", { className: "Select-value" }, children);
            }
        };
        let newVar = arrowProps => { return arrowProps.isOpen ? (React.createElement(ArrowDropUp_1.default, null)) : (React.createElement(ArrowDropDown_1.default, null)); };
        let nv2 = () => React.createElement(Clear_1.default, null);
        let v = props.field.value ?
            {
                label: props.field.getLabel(props.field.value),
                value: props.field.getKey(props.field.value),
                obj: props.field.value
            } : null;
        return (React.createElement(react_select_1.Async, Object.assign({ async: true, cache: {}, loadOptions: (query, cb) => {
                Promise.resolve().then(() => props.field.getOptions(query)).then(res => {
                    cb(null, {
                        options: res.map(o => ({
                            label: props.field.getLabel(o),
                            value: props.field.getKey(o),
                            obj: o
                        }))
                    });
                }, err => {
                    console.log(err);
                });
            }, multi: false, loadingPlaceholder: '', placeholder: props.placeholder || '', optionComponent: Option, noResultsText: React.createElement(Typography_1.default, null, 'No results found'), arrowRenderer: newVar, clearRenderer: nv2 }, other, { value: v, onChange: e => {
                this.props.field.touch();
                this.props.field.value = e ? e.obj : null;
                this.updateDirty();
            } })));
    }
};
SelectWrapped.contextTypes = { muiFormControl: PropTypes.object };
SelectWrapped.childContextTypes = { muiFormControl: PropTypes.object };
SelectWrapped = __decorate([
    mobx_react_1.observer,
    __metadata("design:paramtypes", [Object, Object])
], SelectWrapped);
exports.SelectWrapped = SelectWrapped;
let InnerSelector = class InnerSelector extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.muiFormControl = context.muiFormControl;
        this.field = props.field;
    }
    componentDidMount() {
        this.updateDirty();
    }
    updateDirty() {
        if (this.muiFormControl) {
            if (this.field.getValue()) {
                this.muiFormControl.onFilled();
            }
            else {
                this.muiFormControl.onEmpty();
            }
        }
    }
    componentWillReceiveProps(nextProps, nextContext) {
    }
    render() {
        let ip = {
            simpleValue: false,
            classes: this.props.classes,
            field: this.props.field,
            placeholder: this.props.placeholder || '',
            muiFormControl: this.muiFormControl
        };
        let v = this.field.getValue() ? "any string" : "";
        return React.createElement(Input_1.default, { fullWidth: true, onChange: (v) => { }, value: v, inputComponent: SelectWrapped, inputProps: ip });
    }
};
InnerSelector.contextTypes = { muiFormControl: PropTypes.object };
InnerSelector.childContextTypes = { muiFormControl: PropTypes.object };
InnerSelector = __decorate([
    mobx_react_1.observer,
    __metadata("design:paramtypes", [Object, Object])
], InnerSelector);
exports.InnerSelector = InnerSelector;
exports.Select = styles_1.withStyles(styles_2.styles)(InnerSelector);
