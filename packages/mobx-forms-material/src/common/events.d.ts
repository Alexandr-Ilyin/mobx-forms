/// <reference types="node" />
import { EventEmitter } from "events";
export declare class AppEvent<T> {
    name: string;
    events: EventEmitter;
    constructor();
    trigger(e: T): void;
    listen(callback: (e: T) => any): () => any;
}
