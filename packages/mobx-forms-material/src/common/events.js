"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const entityStore_1 = require("../store/internals/entityStore");
class AppEvent {
    constructor() {
        this.events = new events_1.EventEmitter();
        this.name = entityStore_1.guid();
    }
    trigger(e) {
        this.events.emit(this.name, e);
    }
    listen(callback) {
        this.events.addListener(this.name, callback);
        return () => this.events.removeListener(this.name, callback);
    }
}
exports.AppEvent = AppEvent;
