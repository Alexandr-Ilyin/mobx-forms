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
const dialogService_1 = require("../src/modals/dialogService");
const core_1 = require("@material-ui/core");
const React = require("react");
const assert = require("assert");
var equal = assert.equal;
describe("Dialogs", function () {
    it("should show and return results.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            class Simple {
                render(ctx) {
                    return React.createElement(core_1.Dialog, { open: true },
                        React.createElement(core_1.DialogContent, null,
                            React.createElement("h1", null, "Content"),
                            "Content Content Content Content Content Content Content Content Content Content"),
                        React.createElement(core_1.DialogActions, null,
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close"),
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close")));
                }
            }
            let p1 = yield dialogService_1.DialogService.show(new Simple());
            equal(p1, "a");
        });
    });
    it("should show nested.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            class Simple {
                render(ctx) {
                    return React.createElement(core_1.Dialog, { open: true },
                        React.createElement(core_1.DialogContent, null,
                            React.createElement("h1", null, "Content"),
                            "Content Content Content Content Content Content Content Content Content Content"),
                        React.createElement(core_1.DialogActions, null,
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close"),
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close")));
                }
            }
            class Simple2 {
                render(ctx) {
                    return React.createElement(core_1.Dialog, { open: true },
                        React.createElement(core_1.DialogContent, null,
                            React.createElement("h1", null, "Content")),
                        React.createElement(core_1.DialogActions, null,
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close"),
                            React.createElement(core_1.Button, { onClick: () => ctx.complete("a") }, "Close")));
                }
            }
            let p1 = dialogService_1.DialogService.show(new Simple());
            let p2 = dialogService_1.DialogService.show(new Simple2());
            yield p1;
            yield p2;
        });
    });
});
