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
const Edit_1 = require("@material-ui/icons/Edit");
const ui_attr_1 = require("../common/ui-attr");
const mobx_1 = require("mobx");
const React = require("react");
const _ = require("lodash");
const Table_1 = require("@material-ui/core/Table");
const TableBody_1 = require("@material-ui/core/TableBody");
const TableCell_1 = require("@material-ui/core/TableCell");
const TableFooter_1 = require("@material-ui/core/TableFooter");
const TablePagination_1 = require("@material-ui/core/TablePagination");
const TableRow_1 = require("@material-ui/core/TableRow");
const TableHead_1 = require("@material-ui/core/TableHead");
const asyncLoader_1 = require("../loader/asyncLoader");
const core_1 = require("@material-ui/core");
let Column = class Column {
    constructor(title, format, options) {
        if (!options) {
            options = {};
        }
        this.title = title;
        this.format = format;
        this.options = options;
    }
};
Column = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [Object, Function, Object])
], Column);
exports.Column = Column;
class ListAction {
}
exports.ListAction = ListAction;
class EditAction extends ListAction {
    constructor(editFunc) {
        super();
        this.editFunc = editFunc;
    }
    renderCell(v) {
        return React.createElement("a", { href: "javascript:", onClick: () => this.editFunc(v) },
            React.createElement(Edit_1.default, null));
    }
}
exports.EditAction = EditAction;
class ListActions {
    static Edit(editFunc) { return new EditAction(editFunc); }
    ;
}
exports.ListActions = ListActions;
let List = class List {
    constructor() {
        this.loader = new asyncLoader_1.AsyncLoader();
        this.columns = [];
        this.actions = [];
        this.filters = [];
        this.data = [];
        this.page = 0;
        this.rowsPerPage = 25;
        this.count = 0;
        this.v = 0;
        this.onFilterChanged = _.debounce(this.onFilterChanged.bind(this), 1000);
    }
    setSource(source) {
        return __awaiter(this, void 0, void 0, function* () {
            this.source = source;
            yield this.updateData();
        });
    }
    updateData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.v++;
            let v = this.v;
            return this.loader.wait(() => __awaiter(this, void 0, void 0, function* () {
                let data = yield this.source.getData(this.page * this.rowsPerPage, this.rowsPerPage);
                if (v != this.v)
                    return;
                this.data = data.items;
                this.count = data.totalCount;
            }));
        });
    }
    addFilter(f) {
        this.filters.push(f);
        if (f['getValue']) {
            let firstTime = true;
            mobx_1.autorun(() => {
                f['getValue']();
                setTimeout(() => {
                    if (!firstTime) {
                        return this.onFilterChanged();
                    }
                    firstTime = false;
                });
            });
        }
    }
    onFilterChanged() {
        if (this.source != null) {
            this.updateData();
        }
    }
    addRowAction(a) {
        this.actions.push(a);
    }
    onRowClick(a) {
        this._onRowClick = a;
    }
    addColumn(title, format) {
        this.columns.push(new Column(title, format));
    }
    render() {
        return React.createElement("div", null,
            this.filters.length > 0 &&
                React.createElement(core_1.Grid, { justify: 'flex-end', alignItems: 'flex-end', container: true, alignContent: 'flex-end' }, this.filters.map(f => {
                    return React.createElement(core_1.Grid, { item: true, xs: 4, alignItems: 'flex-end', alignContent: 'flex-end' }, f.render());
                })),
            React.createElement("div", null, this.loader.render(React.createElement(Table_1.default, null,
                React.createElement(TableHead_1.default, null,
                    React.createElement(TableRow_1.default, null,
                        this.columns.map(c => React.createElement(TableCell_1.default, null, c.title)),
                        React.createElement(TableCell_1.default, null))),
                this.data.map(n => {
                    return (React.createElement(TableBody_1.default, null,
                        React.createElement(TableRow_1.default, { key: n.id, className: "list-row list-row-selectable-" + (this._onRowClick != null), onClick: this._onRowClick == null ? null : () => this._onRowClick(n) },
                            this.columns.map(c => React.createElement(TableCell_1.default, null, c.format(n))),
                            React.createElement(TableCell_1.default, { padding: "none" }, this.actions.map((x) => x.renderCell(n))))));
                }),
                this.count > this.data.length && React.createElement(TableFooter_1.default, null,
                    React.createElement(TableRow_1.default, null,
                        React.createElement(TablePagination_1.default, { colSpan: 3, count: this.count, rowsPerPage: this.rowsPerPage, page: this.page, onChangePage: (e, a) => this.handleChangePage(a), onChangeRowsPerPage: (e) => this.handleChangeRowsPerPage(e.target.value) })))))));
    }
    handleChangePage(pageNum) {
        this.page = pageNum;
        this.updateData();
    }
    handleChangeRowsPerPage(rowsPerPage) {
        this.rowsPerPage = rowsPerPage;
        this.updateData();
    }
};
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "loader", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], List.prototype, "columns", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], List.prototype, "actions", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], List.prototype, "filters", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Array)
], List.prototype, "data", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "page", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "rowsPerPage", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "count", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "v", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], List.prototype, "_onRowClick", void 0);
List = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [])
], List);
exports.List = List;
