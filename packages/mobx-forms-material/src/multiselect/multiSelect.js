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
const PropTypes = require("prop-types");
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
function SelectWrapped(props) {
    const { classes } = props, other = __rest(props, ["classes"]);
    function renderValue(valueProps) {
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
    }
    return (React.createElement(react_select_1.Async, Object.assign({ async: true, cache: {}, loadOptions: (query, cb) => {
            Promise.resolve().then(() => props.field.getOptions(query)).then(res => {
                cb(null, { options: res.map(x => ({
                        label: props.field.getLabel(x),
                        value: props.field.getKey(x),
                        obj: x
                    })) });
            }, err => {
                console.log(err);
            });
        }, onChange: e => {
            this.props.field.touch();
            this.props.field.value = e.map(x => x.obj);
        }, multi: true, value: props.field.value, optionComponent: Option, noResultsText: React.createElement(Typography_1.default, null, 'No results found'), arrowRenderer: arrowProps => { return arrowProps.isOpen ? React.createElement(ArrowDropUp_1.default, null) : React.createElement(ArrowDropDown_1.default, null); }, clearRenderer: () => React.createElement(Clear_1.default, null), valueComponent: valueProps => renderValue(valueProps) }, other)));
}
let InnerSelector = class InnerSelector extends React.Component {
    constructor(props, context) {
        super(props);
        this.muiFormControl = context.muiFormControl;
    }
    componentDidMount() {
        this.updateDirty();
    }
    updateDirty() {
        if (this.muiFormControl) {
            if (!this.props.field.isEmpty()) {
                this.muiFormControl.onFilled();
            }
            else {
                this.muiFormControl.onEmpty();
            }
        }
    }
    render() {
        return React.createElement(Input_1.default, { fullWidth: true, onChange: (v) => {
                if (!v)
                    v = [];
                this.props.field.setValue(v.map(x => x.obj));
                this.updateDirty();
            }, value: (this.props.field.isEmpty() ? '' : this.props.field.getValueKeys()), inputComponent: SelectWrapped, inputProps: {
                simpleValue: false,
                placeholder: '',
                classes: this.props.classes,
                field: this.props.field,
                muiFormControl: this.muiFormControl
            } });
    }
};
InnerSelector.contextTypes = { muiFormControl: PropTypes.object };
InnerSelector.childContextTypes = { muiFormControl: PropTypes.object };
InnerSelector = __decorate([
    mobx_react_1.observer,
    __metadata("design:paramtypes", [Object, Object])
], InnerSelector);
exports.InnerSelector = InnerSelector;
exports.MultiSelect = styles_1.withStyles(styles_2.styles)(InnerSelector);
