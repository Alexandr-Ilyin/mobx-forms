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
const Button_1 = require("@material-ui/core/Button");
const Dialog_1 = require("@material-ui/core/Dialog");
const DialogActions_1 = require("@material-ui/core/DialogActions");
const DialogContent_1 = require("@material-ui/core/DialogContent");
const DialogContentText_1 = require("@material-ui/core/DialogContentText");
const DialogTitle_1 = require("@material-ui/core/DialogTitle");
const ui_attr_1 = require("../common/ui-attr");
const offlineIcon_1 = require("./offlineIcon");
const offlines_1 = require("../common/offlines");
function getErrorUi(error) {
    if (!error) {
        return null;
    }
    if (offlines_1.isOfflineError(error)) {
        return React.createElement(offlineIcon_1.OfflineErrorIcon, null);
    }
    if (typeof (error) === "string") {
        return error;
    }
    if (error && error.htmlMessage) {
        return error.htmlMessage;
    }
    if (error && error.message) {
        return error.message;
    }
    return null;
}
exports.getErrorUi = getErrorUi;
let ErrorModal = class ErrorModal {
    constructor(err) {
        this.err = err;
    }
    render(ctx) {
        return React.createElement(Dialog_1.default, { open: true },
            React.createElement(DialogTitle_1.default, null, "Error"),
            React.createElement(DialogContent_1.default, { style: { minWidth: "340px" } },
                React.createElement(DialogContentText_1.default, null, getErrorUi(this.err))),
            React.createElement(DialogActions_1.default, null,
                React.createElement(Button_1.default, { onClick: () => ctx.complete(null), color: "primary" }, "Close")));
    }
};
ErrorModal = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object])
], ErrorModal);
exports.ErrorModal = ErrorModal;
