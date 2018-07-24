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
const testHelper_1 = require("../testRunner/utils/testHelper");
const entityStore_1 = require("../src/store/internals/entityStore");
const React = require("react");
const strField_1 = require("../src/strField");
const ui_attr_1 = require("../src/common/ui-attr");
const cardForm_1 = require("../src/cardForm/cardForm");
const core_1 = require("@material-ui/core");
const Grid_1 = require("@material-ui/core/Grid");
const multiSelectField_1 = require("../src/multiselect/multiSelectField");
const selectField_1 = require("../src/select/selectField");
let getOptions = (query) => __awaiter(this, void 0, void 0, function* () {
    return [
        { label: "Option A", value: "A" },
        { label: "Option B", value: "B" },
        { label: "Option C", value: "C" }
    ];
});
describe("Forms", function () {
    it("should show str fields.", function () {
        let UserForm = class UserForm extends cardForm_1.CardForm {
            constructor() {
                super(...arguments);
                this.name = new strField_1.StrField(this, { displayName: "name" });
                this.lastName = new strField_1.StrField(this, { displayName: "last name" });
            }
            init() {
                return __awaiter(this, void 0, void 0, function* () {
                    return entityStore_1.wait(1000);
                });
            }
            renderBody() {
                return React.createElement(Grid_1.default, { container: true, spacing: 8 },
                    React.createElement(Grid_1.default, { item: true, xs: 12 }, this.name.render()),
                    React.createElement(Grid_1.default, { item: true, xs: 12 }, this.lastName.render()));
            }
            renderActions() {
                return [
                    React.createElement(core_1.Button, { size: "small" }, "Save"),
                    React.createElement(core_1.Button, { size: "small" }, "Close")
                ];
            }
        };
        UserForm = __decorate([
            ui_attr_1.cmp
        ], UserForm);
        let f = new UserForm(null);
        testHelper_1.renderTestElement(f.render());
    });
    it("should show multi select field.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let UserForm = class UserForm extends cardForm_1.CardForm {
                constructor() {
                    super(...arguments);
                    this.positions = new multiSelectField_1.MultiSelectField(this, {
                        displayName: "Positions...", getOptions: getOptions
                    });
                }
                renderBody() {
                    return React.createElement(core_1.Paper, { style: { height: "300px" } },
                        React.createElement(Grid_1.default, { container: true, spacing: 8 },
                            React.createElement(Grid_1.default, { item: true, xs: 4 }, this.positions.render())));
                }
            };
            UserForm = __decorate([
                ui_attr_1.cmp
            ], UserForm);
            let f = new UserForm(null);
            testHelper_1.renderTestElement(React.createElement(core_1.Paper, { style: { height: "300px" } }, f.render()));
        });
    });
    it("should show select field.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let UserForm = class UserForm extends cardForm_1.CardForm {
                constructor() {
                    super(...arguments);
                    this.position = new selectField_1.SelectField(this, {
                        displayName: "Position", getOptions: getOptions
                    });
                }
                renderBody() {
                    return React.createElement(core_1.Paper, { style: { height: "300px" } },
                        React.createElement(Grid_1.default, { container: true, spacing: 8 },
                            React.createElement(Grid_1.default, { item: true, xs: 4 }, this.position.render())));
                }
            };
            UserForm = __decorate([
                ui_attr_1.cmp
            ], UserForm);
            let f = new UserForm(null);
            testHelper_1.renderTestElement(React.createElement(core_1.Paper, { style: { height: "300px" } }, f.render()));
        });
    });
});
