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
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ui_attr_1 = require("../common/ui-attr");
const dialogService_1 = require("../modals/dialogService");
const errorModal_1 = require("./errorModal");
const trackAsync_1 = require("../common/trackAsync");
const badgePanel_1 = require("../badgePanel/badgePanel");
const errorContainer_1 = require("../errorContainer/errorContainer");
const wait_1 = require("../common/wait");
let AsyncLoader = class AsyncLoader {
    constructor() {
        this.badgePanel = new badgePanel_1.BadgePanel();
    }
    wait(promise, notificationMsg) {
        if (typeof promise != 'function')
            return this.waitPromise(promise, notificationMsg);
        else
            return this.waitPromise(Promise.resolve().then(promise), notificationMsg);
    }
    waitPromise(promise, notificationMsg) {
        let slowPromise = this.badgePanel.addLoading(slowUiPromise(promise));
        return slowPromise.then((x) => {
            if (notificationMsg) {
                return this.badgePanel.addMessage(notificationMsg, wait_1.wait(1000)).then(() => x);
            }
            return x;
        }, err => {
            if (err != 'cancel') {
                this.showError(err);
            }
            return Promise.reject(err);
        });
    }
    showError(err) {
        console.log("Error:");
        console.log(err);
        dialogService_1.DialogService.show(new errorModal_1.ErrorModal(err));
    }
    render(children) {
        return React.createElement(errorContainer_1.ErrorContainer, null, this.badgePanel.render({ children: children }));
    }
};
__decorate([
    trackAsync_1.trackAsync(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Promise, Object]),
    __metadata("design:returntype", Promise)
], AsyncLoader.prototype, "waitPromise", null);
AsyncLoader = __decorate([
    ui_attr_1.cmp
], AsyncLoader);
exports.AsyncLoader = AsyncLoader;
function slowUiPromise(p) {
    return new Promise((resolve, reject) => {
        let isFinished = false;
        let isFail = false;
        let isOk = false;
        let result = null;
        let error = null;
        let isFast = true;
        let hasWaited = false;
        function tryFinish() {
            if (isFinished) {
                return;
            }
            if (!isFail && !isOk) {
                return;
            }
            if (!isFast && !hasWaited) {
                return;
            }
            isFinished = true;
            if (isFail) {
                reject(error);
            }
            if (isOk) {
                resolve(result);
            }
        }
        p.then(function (r) {
            result = r;
            isOk = true;
            tryFinish();
        }, function (err) {
            error = err;
            isFail = true;
            tryFinish();
        });
        setTimeout(function () {
            isFast = false;
        }, 300);
        setTimeout(function () {
            hasWaited = true;
            tryFinish();
        }, 900);
    });
}
function slowPromise(p, time) {
    if (time == null) {
        time = 700;
    }
    if (time === 0) {
        return Promise.resolve().then(() => p);
    }
    return wait_1.wait(time).then(() => p);
}
