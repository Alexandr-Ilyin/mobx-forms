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
const amim_1 = require("../src/animation/amim");
const assert = require("assert");
describe("Merge", function () {
    it("check merge 1.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'A' }, { key: 'B' }, { key: 'C' }], [{ key: 'B' }, { key: 'X' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'C', 'X']);
        });
    });
    it("check merge 2.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'A' }, { key: 'B' }], [{ key: 'C' }, { key: 'D' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'C', 'D']);
        });
    });
    it("check-merge-3.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'B' }, { key: 'X' }], [{ key: 'A' }, { key: 'B' }, { key: 'C' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'X', 'C']);
        });
    });
    it("check merge 4.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'B' }, { key: 'C' }], [{ key: 'B' }, { key: 'D' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C', 'D']);
        });
    });
    it("check merge 5.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'B' }, { key: 'C' }], []);
            assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C']);
        });
    });
    it("check merge 6.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([], [{ key: 'B' }, { key: 'C' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C']);
        });
    });
    it("check merge 7.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([], [{ key: 'B' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['B']);
        });
    });
    it("check merge 8.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'B' }], []);
            assert.deepStrictEqual(merged.map(x => x.key), ['B']);
        });
    });
    it("check merge 9.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let merged = amim_1.merge([{ key: 'B' }], [{ key: 'B' }]);
            assert.deepStrictEqual(merged.map(x => x.key), ['B']);
        });
    });
    it("check merge 10.", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let removed = [];
            let merged = amim_1.merge([{ key: 'B' }], [{ key: 'B' }], (x) => { removed.push(x.key); });
            assert.deepStrictEqual(removed, []);
            assert.deepStrictEqual(merged.map(x => x.key), ['B']);
        });
    });
});
