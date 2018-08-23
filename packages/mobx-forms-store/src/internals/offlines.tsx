import { Progress } from '../utils/progress';
import { isOfflineError } from '../utils/errors';
import {extras,observable} from "mobx";
import { Queue } from '../utils/queue';
import { wait } from '../utils/wait';
let emulateFromJs = observable(false);
let _isRealOffline = observable(false);

_isRealOffline.set(navigator.onLine === false);
window.addEventListener('online', () => _isRealOffline.set(navigator.onLine === false));
window.addEventListener('offline', () => _isRealOffline.set(navigator.onLine === false));

export function emualtedOffline() {
  if (emulateFromJs.get()) {
    return true;
  }
  return /\?offline/.test(window.location.search);
}

let send_backup = XMLHttpRequest.prototype.send;
let open_backup = XMLHttpRequest.prototype.open;
let patched = false;

export function startOfflineMonitoring() {
  if (patched) {
    return;
  }
  patched = true;

  XMLHttpRequest.prototype.send = function() {
    if (emualtedOffline()) {
      throw getOfflineError();
    }

    let __onreadystatechange = this.onreadystatechange;
    let s = this;
    this.onreadystatechange = function() {
      if (s.readyState == 4 && s.status <= 0) {
        _isRealOffline.set(true);
      }
      if (s.readyState == 4 && s.status >= 2) {
        _isRealOffline.set(false);
      }
      if (__onreadystatechange) {
        __onreadystatechange.apply(this, arguments);
      }
    };
    send_backup.apply(this, arguments);
  };
}


export function setRealOnline() {
  _isRealOffline.set(false);
}
export function isOffline() {
  return !!(_isRealOffline.get() || emualtedOffline());
}

export function setOnline(v?: boolean) {
  if (v === undefined) {
    v = true;
  }
  setOffline(!v);
}

export function setOffline(v?: boolean) {
  if (v === undefined) {
    v = true;
  }
  emulateFromJs.set(v);
  _isRealOffline.set(false);
  startOfflineMonitoring();
}

export function retryOffline<T>(func) {
  return function() {
    let self = this;
    let args = arguments;
    let x;
    try {
      x = func.apply(self, args);
    } catch (error) {
      if (isOfflineError(error)) {
        console.log("Offline retry");
        return func.apply(self, args);
      }
      else {
        throw error;
      }
    }
    if (x && x.catch && typeof(x.catch) == 'function') {
      return x.catch(err => {
        if (isOfflineError(err)) {
          _isRealOffline.set(true);
          console.log("Offline retry");
          return func.apply(self, args);
        }
        else {
          return Promise.reject(err);
        }
      })
    }
    else {
      return x;
    }
  }
}

export function getOfflineError(url?) {
  let error = new Error("App is offline") as any;
  error.url = url;
  error.isOfflineError = true;
  return error;
}

export function isOnline() {
  return !isOffline();
}

export function offlineRetry() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let wrapped = target[propertyKey];
    descriptor.value = target[propertyKey] = retryOffline(wrapped);
  };
}

export class OfflineChangesSaver {
  @observable saved = 0;
  @observable total = 0;
  saveFuncs: Array<(throwOnErr: boolean, p: Progress) => void> = [];
  q = new Queue();

  async go() {
    await this.q.enqueue(() => this._go());
  }

  async waitFinished(): Promise<any> {
    await wait(10);
    await this.q.promise;
  }

  async addSaveFunc(saveFunc: (throwOnErr: boolean, p: Progress) => void) {
    this.saveFuncs.push(saveFunc);
  }

  async _go() {
    if (isOffline()) {
      return;
    }

    let fullProgress = new Progress('full');
    fullProgress.totalCount(0);
    fullProgress.onChange(() => {
      let fullStat = fullProgress.fullStat();
      this.saved = fullStat.completeUnits;
      this.total = fullStat.fullUnits;
    });
    for (let i = 0; i < this.saveFuncs.length; i++) {
      let f = this.saveFuncs[i];
      let progress = fullProgress.child("sav_func" + i);
      progress.totalCount(0);
      await f(false, progress);
    }
  }

  get isFinished() {
    return this.saved == this.total;
  }
}