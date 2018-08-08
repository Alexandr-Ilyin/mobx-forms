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
const core_1 = require("@material-ui/core");
const React = require("react");
const bladePanel_1 = require("../src/bladepanel/bladePanel");
const ui_attr_1 = require("../src/common/ui-attr");
const testHelper_1 = require("../testRunner/utils/testHelper");
const history = require("history");
const strField_1 = require("../src/strField");
const list_1 = require("../src/list/list");
const validators_1 = require("../src/forms/validators");
const entityStore_1 = require("../src/store/internals/entityStore");
const cardForm_1 = require("../src/cardForm/cardForm");
const bladeAppLayout_1 = require("../src/bladeAppLayout/bladeAppLayout");
const icons_1 = require("@material-ui/icons");
const icons_2 = require("@material-ui/icons");
const multiSelectField_1 = require("../src/multiselect/multiSelectField");
const dateField_1 = require("../src/dateField");
let h = history.createHashHistory();
let getOptions = (query) => __awaiter(this, void 0, void 0, function* () {
    return [
        { label: "Option A", value: "A" },
        { label: "Option B", value: "B" },
        { label: "Option C", value: "C" }
    ];
});
;
let arr = [];
for (let i = 0; i < 100; i++) {
    arr.push({
        name: "Ivan" + i,
        lastName: "Turgenev" + i,
        id: i
    });
}
;
describe("Blades", function () {
    it("can add panels dynamically", function () {
        let UserList = class UserList {
            constructor() {
                this.bladeStyle = {
                    "minWidth": "600px",
                    "flex": "1"
                };
            }
            render() {
                return React.createElement("div", { style: { 'background': '' } },
                    React.createElement("b", null, "panel"),
                    React.createElement("br", null),
                    React.createElement("br", null),
                    React.createElement("button", { onClick: () => { bladePanel_1.pushBlade("/users", h); } }, "Add panel"));
            }
        };
        UserList = __decorate([
            ui_attr_1.cmp
        ], UserList);
        let Demo = class Demo {
            constructor() {
                this.bladeStyle = {
                    "minWidth": "600px",
                    "flex": "1"
                };
            }
            render() {
                return React.createElement("div", { style: { 'background': '' } },
                    React.createElement("b", null, "panel"),
                    React.createElement("br", null),
                    React.createElement("br", null),
                    "Here we are");
            }
        };
        Demo = __decorate([
            ui_attr_1.cmp
        ], Demo);
        let SampleApp1 = class SampleApp1 {
            constructor() {
                this.panel = new bladePanel_1.BladePanel();
                this.panel.addRoute({ path: "users", title: "users", makeCmp: () => new UserList() });
                this.panel.addRoute({ path: "demo", title: "demo", makeCmp: () => new Demo() });
            }
            render() {
                return this.panel.render();
            }
        };
        SampleApp1 = __decorate([
            ui_attr_1.cmp,
            __metadata("design:paramtypes", [])
        ], SampleApp1);
        let app = new SampleApp1();
        testHelper_1.renderTestElement(React.createElement("div", { style: { width: "1000px", height: "700px", border: "1px solid gray" } }, app.render()));
        app.panel.connectToHistory(h);
        app.panel.push("users");
    });
    it("composite test", function () {
        let layout = new bladeAppLayout_1.BladeAppLayout();
        let bp = layout.bladePanel;
        let UserDetails = class UserDetails extends cardForm_1.CardForm {
            constructor() {
                super(...arguments);
                this.userName = new strField_1.StrField(this, { displayName: "Name" });
                this.lastName = new strField_1.StrField(this, { displayName: "Last name", validations: [validators_1.Validation.required()] });
                this.birthdaty = new dateField_1.DateField(this, { displayName: "Birthday" });
                this.options = new multiSelectField_1.MultiSelectFieldStr(this, {
                    displayName: "Options",
                    validations: [validators_1.Validation.required()],
                    getOptions: getOptions,
                });
            }
            renderActions() {
                return React.createElement(core_1.Button, { size: "large", color: "primary", variant: 'outlined' }, "Save");
            }
            renderBody() {
                return React.createElement(core_1.Grid, { spacing: 8 },
                    React.createElement(core_1.Grid, null, this.userName.render()),
                    React.createElement(core_1.Grid, null, this.lastName.render()),
                    React.createElement(core_1.Grid, null, this.options.render()),
                    React.createElement(core_1.Grid, null, this.birthdaty.render()),
                    React.createElement(core_1.Grid, null,
                        React.createElement("a", { onClick: () => {
                                bp.pushAfter("user-1", this);
                            } }, "Show manager")));
            }
        };
        UserDetails = __decorate([
            ui_attr_1.cmp
        ], UserDetails);
        bp.addRoute({
            path: "user-{id}",
            makeCmp: (params) => {
                let userDetails = new UserDetails(null);
                userDetails.lastName.value = arr.find(x => x.id == params.id).lastName;
                userDetails.userName.value = arr.find(x => x.id == params.id).name;
                return userDetails;
            }
        });
        bp.addRoute({
            path: "users", makeCmp: () => {
                let list = new list_1.List();
                list.addColumn("Name", u => u.name);
                list.addColumn("Last name", u => u.lastName);
                list.addRowAction(list_1.ListActions.Edit(u => bp.pushAfter("user-" + u.id, list)));
                let q = new strField_1.StrField(null, { displayName: "Query" });
                list.addFilter(q);
                list.setSource({
                    getData: (t, s) => __awaiter(this, void 0, void 0, function* () {
                        yield entityStore_1.wait(800);
                        return {
                            items: arr.filter(x => x.lastName.indexOf(q.value || '') >= 0).slice(t, t + s),
                            totalCount: arr.length
                        };
                    })
                });
                return list;
            }, style: { minWidth: "400px", flex: 1 }, title: "User list"
        });
        bp.push("users");
        layout.addItem("Users", React.createElement(icons_1.Inbox, null), "users");
        layout.addItem("Countries", React.createElement(icons_2.PeopleOutline, null), "countries");
        layout.addItem("Branches", React.createElement(icons_1.Inbox, null), "branches");
        layout.addItem("Positions", React.createElement(icons_1.Inbox, null), "positions");
        testHelper_1.renderTestElement(React.createElement("div", { style: { width: "1000px", height: "700px", border: "1px solid gray", position: 'absolute' } }, layout.render()));
    });
});
