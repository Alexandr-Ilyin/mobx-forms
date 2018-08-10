"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const basic_1 = require("../forms/basic");
const asyncLoader_1 = require("../loader/asyncLoader");
const Card_1 = require("@material-ui/core/Card");
const CardActions_1 = require("@material-ui/core/CardActions");
const CardContent_1 = require("@material-ui/core/CardContent");
const core_1 = require("@material-ui/core");
const React = require("react");
class CardForm extends basic_1.FormBase {
    constructor(parent) {
        super(parent);
        this.loader = new asyncLoader_1.AsyncLoader();
        setTimeout(() => this.loader.wait(this.init()));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    renderHeader() {
        return null;
    }
    renderActions() {
        return null;
    }
    render() {
        let header = this.renderHeader() || null;
        let actions = this.renderActions() || null;
        return React.createElement(Card_1.default, { className: "card-form" },
            header && React.createElement(core_1.CardHeader, null, header),
            React.createElement(CardContent_1.default, null, this.loader.render(this.renderBody())),
            actions && React.createElement(CardActions_1.default, null, actions));
    }
}
exports.CardForm = CardForm;
