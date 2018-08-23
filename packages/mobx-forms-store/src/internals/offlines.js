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
const progress_1 = require("../utils/progress");
const errors_1 = require("../utils/errors");
const mobx_1 = require("mobx");
const queue_1 = require("../utils/queue");
const wait_1 = require("../utils/wait");
let emulateFromJs = mobx_1.observable(false);
let _isRealOffline = mobx_1.observable(false);
_isRealOffline.set(navigator.onLine === false);
window.addEventListener('online', () => _isRealOffline.set(navigator.onLine === false));
window.addEventListener('offline', () => _isRealOffline.set(navigator.onLine === false));
function emualtedOffline() {
    if (emulateFromJs.get()) {
        return true;
    }
    return /\?offline/.test(window.location.search);
}
exports.emualtedOffline = emualtedOffline;
let send_backup = XMLHttpRequest.prototype.send;
let open_backup = XMLHttpRequest.prototype.open;
let patched = false;
function startOfflineMonitoring() {
    if (patched) {
        return;
    }
    patched = true;
    XMLHttpRequest.prototype.send = function () {
        if (emualtedOffline()) {
            throw getOfflineError();
        }
        let __onreadystatechange = this.onreadystatechange;
        let s = this;
        this.onreadystatechange = function () {
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
exports.startOfflineMonitoring = startOfflineMonitoring;
function setRealOnline() {
    _isRealOffline.set(false);
}
exports.setRealOnline = setRealOnline;
function isOffline() {
    return !!(_isRealOffline.get() || emualtedOffline());
}
exports.isOffline = isOffline;
function setOnline(v) {
    if (v === undefined) {
        v = true;
    }
    setOffline(!v);
}
exports.setOnline = setOnline;
function setOffline(v) {
    if (v === undefined) {
        v = true;
    }
    emulateFromJs.set(v);
    _isRealOffline.set(false);
    startOfflineMonitoring();
}
exports.setOffline = setOffline;
function retryOffline(func) {
    return function () {
        let self = this;
        let args = arguments;
        let x;
        try {
            x = func.apply(self, args);
        }
        catch (error) {
            if (errors_1.isOfflineError(error)) {
                console.log("Offline retry");
                return func.apply(self, args);
            }
            else {
                throw error;
            }
        }
        if (x && x.catch && typeof (x.catch) == 'function') {
            return x.catch(err => {
                if (errors_1.isOfflineError(err)) {
                    _isRealOffline.set(true);
                    console.log("Offline retry");
                    return func.apply(self, args);
                }
                else {
                    return Promise.reject(err);
                }
            });
        }
        else {
            return x;
        }
    };
}
exports.retryOffline = retryOffline;
function getOfflineError(url) {
    let error = new Error("App is offline");
    error.url = url;
    error.isOfflineError = true;
    return error;
}
exports.getOfflineError = getOfflineError;
function isOnline() {
    return !isOffline();
}
exports.isOnline = isOnline;
function offlineRetry() {
    return function (target, propertyKey, descriptor) {
        let wrapped = target[propertyKey];
        descriptor.value = target[propertyKey] = retryOffline(wrapped);
    };
}
exports.offlineRetry = offlineRetry;
class OfflineChangesSaver {
    constructor() {
        this.saved = 0;
        this.total = 0;
        this.saveFuncs = [];
        this.q = new queue_1.Queue();
    }
    go() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.q.enqueue(() => this._go());
        });
    }
    waitFinished() {
        return __awaiter(this, void 0, void 0, function* () {
            yield wait_1.wait(10);
            yield this.q.promise;
        });
    }
    addSaveFunc(saveFunc) {
        return __awaiter(this, void 0, void 0, function* () {
            this.saveFuncs.push(saveFunc);
        });
    }
    _go() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOffline()) {
                return;
            }
            let fullProgress = new progress_1.Progress('full');
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
                yield f(false, progress);
            }
        });
    }
    get isFinished() {
        return this.saved == this.total;
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], OfflineChangesSaver.prototype, "saved", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], OfflineChangesSaver.prototype, "total", void 0);
exports.OfflineChangesSaver = OfflineChangesSaver;
