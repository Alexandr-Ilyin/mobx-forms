import { EventEmitter } from "events";
import { guid } from '../store/internals/entityStore';

export class AppEvent<T> {
  name: string;
  events = new EventEmitter();

  constructor() {
    this.name = guid();
  }

  trigger(e: T) {
    this.events.emit(this.name, e);
  }

  listen(callback: (e: T) => any): () => any {
    this.events.addListener(this.name, callback);
    return () => this.events.removeListener(this.name, callback);
  }
}
