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
const testHelper_1 = require("../testRunner/utils/testHelper");
const entityStore_1 = require("../src/store/internals/entityStore");
const strField_1 = require("../src/strField");
const list_1 = require("../src/list/list");
class User {
}
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
describe("Lists", function () {
    it("should shows and filters .", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let list = new list_1.List();
            list.addColumn("Name", u => u.name);
            list.addColumn("Last name", u => u.lastName);
            let query = new strField_1.StrField(null, { displayName: "Query" });
            list.addFilter(query);
            yield list.setSource({
                getData: (t, s) => __awaiter(this, void 0, void 0, function* () {
                    yield entityStore_1.wait(800);
                    return { items: arr.filter(x => x.lastName.indexOf(query.value || '') >= 0).slice(t, t + s), totalCount: arr.length };
                })
            });
            testHelper_1.renderTestElement(list.render());
        });
    });
});
