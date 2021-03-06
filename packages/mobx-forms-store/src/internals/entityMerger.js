"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const toDict_1 = require("../utils/toDict");
const guid_1 = require("../utils/guid");
class EntityMerger {
    constructor(metaProvider) {
        this.metaProvider = metaProvider;
    }
    merge(oldVals, newVals, type) {
        let current = _.cloneDeep(oldVals);
        this.__merge(current, newVals, type);
        return current;
    }
    __merge(current, newVals, type) {
        if (!newVals) {
            throw new Error("Object expected");
        }
        for (let k in newVals) {
            if (!newVals.hasOwnProperty(k) || typeof (newVals[k]) === 'function') {
                continue;
            }
            let p = type.getProp(k);
            if (!p || p.isSimple()) {
                current[k] = newVals[k];
            }
            else if (p.isNested) {
                if (!current[k]) {
                    current[k] = {};
                }
                this.__merge(current[k], newVals[k], this.metaProvider.getType(p.nestedTypeName));
            }
            else if (p.isNestedCollection) {
                if (!current[k]) {
                    current[k] = [];
                }
                let currentArr = current[k];
                let newArr = newVals[k];
                let itemType = this.metaProvider.getType(p.nestedCollTypeName);
                let itemKeyGetter = this.metaProvider.tryGetKeyGetter(itemType);
                if (itemKeyGetter == null) {
                    current[p.name] = newArr;
                }
                let cd = toDict_1.toDict(currentArr, x => (itemKeyGetter(x) || guid_1.guid()));
                let nd = toDict_1.toDict(newArr, x => (itemKeyGetter(x) || guid_1.guid()));
                let updatedValue = [];
                for (let key in nd) {
                    let newItem = nd[key];
                    let oldItem = cd[key] || {};
                    this.__merge(oldItem, newItem, itemType);
                    updatedValue.push(oldItem);
                }
                current[p.name] = updatedValue;
            }
        }
        return current;
    }
}
exports.EntityMerger = EntityMerger;
