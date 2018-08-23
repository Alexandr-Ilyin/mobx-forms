"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeArrayItem(x, items) {
    let index = items.findIndex(i => i === x);
    if (index >= 0) {
        items.splice(index, 1);
    }
}
exports.removeArrayItem = removeArrayItem;
