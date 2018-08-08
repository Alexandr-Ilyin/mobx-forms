"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
var progressId = 1;
let minTaskSize = 1;
class Progress {
    constructor(name) {
        this._children = [];
        this._completeCount = 0;
        this._events = new EventEmitter();
        this._id = "P" + (progressId++);
        this._name = name;
    }
    totalCount(count) {
        this._totalCount = count;
        this.log(this._name + " - set total:", count);
        this.triggerOnChange();
        return this;
    }
    waitTotalBytes(getCount) {
        getCount.then(v => {
            this.totalCount(v);
        });
        return this;
    }
    completeCount(length) {
        this._completeCount += length;
        this.triggerOnChange();
    }
    child(name) {
        var progress = new Progress();
        progress._name = name;
        progress.totalCount(1);
        this._children.push(progress);
        progress.onChange(() => this.triggerOnChange());
        return progress;
    }
    complete(completeChildren) {
        if (completeChildren) {
            this._runRecursive(x => {
                if (x._totalCount) {
                    x._completeCount = x._totalCount;
                }
            });
        }
        if (this._totalCount) {
            this._completeCount = this._totalCount;
        }
        this.triggerOnChange();
        return this;
    }
    log(...args) {
    }
    mon(p) {
        p.then(() => this.complete());
        return p;
    }
    _runRecursive(f, d) {
        if (!d) {
            d = 0;
        }
        f(this, d);
        for (var i = 0; i < this._children.length; i++) {
            this._children[i]._runRecursive(f, d + 1);
        }
    }
    fullProgress() {
        let stat = this.fullStat();
        return stat.completeUnits / stat.fullUnits;
    }
    fullStat() {
        var fullUnits = 0.0;
        var completeUnits = 0.0;
        var visited = {};
        this._runRecursive(x => {
            if (visited[x._id]) {
                return;
            }
            visited[x._id] = true;
            if (x._totalCount) {
                fullUnits += x._totalCount;
                completeUnits += x._completeCount;
            }
        });
        return { completeUnits, fullUnits };
    }
    withChild(child) {
        this._children.push(child);
        child.onChange(() => this.triggerOnChange());
        return this;
    }
    addChild(child) {
        this._children.push(child);
        child.onChange(() => this.triggerOnChange());
        return child;
    }
    triggerOnChange() {
        this._events.emit("change");
    }
    onChange(handler) {
        this._events.on("change", handler);
    }
    unChange(handler) {
        this._events.removeListener("change", handler);
    }
    getLog() {
        var result = "";
        result += "CURRENT PROGRESS:" + this.fullProgress() + "\n";
        this._runRecursive((x, depth) => {
            var prefix = "";
            for (var i = 0; i < depth; i++) {
                prefix += "    ";
            }
            result += prefix;
            result += x._name || "[unnamed]";
            result += ":";
            result += x._completeCount + "/" + x._totalCount + " bytes";
            result += "\n";
        });
        return result;
    }
}
exports.Progress = Progress;
