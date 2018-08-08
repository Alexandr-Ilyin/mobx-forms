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
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
const ui_attr_1 = require("../common/ui-attr");
const dialogService_1 = require("../modals/dialogService");
const errorModal_1 = require("./errorModal");
const trackAsync_1 = require("../common/trackAsync");
const queue_1 = require("../common/queue");
const CircularProgress_1 = require("@material-ui/core/CircularProgress");
const events_1 = require("../common/events");
const utils_1 = require("../common/utils");
const entityStore_1 = require("../store/internals/entityStore");
let AsyncLoader = class AsyncLoader {
    constructor() {
        this.queue = new queue_1.Queue();
        this.mustShowNotification = new events_1.AppEvent();
    }
    wait(promise, notificationMsg) {
        let wrappedPromise = promise;
        if (typeof promise != "function") {
            wrappedPromise = () => slowUiPromise(promise);
        }
        else {
            wrappedPromise = () => slowUiPromise(promise());
        }
        this.loading = true;
        return this.queue.enqueue(wrappedPromise).then((x) => {
            if (this.queue.isEmpty()) {
                this.loading = false;
            }
            return x;
        }, err => {
            if (this.queue.isEmpty()) {
                this.loading = false;
            }
            if (err != 'cancel') {
                this.showError(err);
            }
            return Promise.reject(err);
        }).then((x) => {
            if (notificationMsg) {
                this.mustShowNotification.trigger(notificationMsg);
            }
            return x;
        });
    }
    showError(err) {
        console.log("Error:");
        console.log(err);
        dialogService_1.DialogService.show(new errorModal_1.ErrorModal(err));
    }
    load(getter) {
        this.getter = getter;
        this.loading = true;
        return this.refresh();
    }
    render(children) {
        return React.createElement(AsyncLoaderUI, { loader: this }, children);
    }
};
__decorate([
    mobx_1.observable,
    __metadata("design:type", Boolean)
], AsyncLoader.prototype, "loading", void 0);
__decorate([
    trackAsync_1.trackAsync(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AsyncLoader.prototype, "wait", null);
__decorate([
    trackAsync_1.trackAsync(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AsyncLoader.prototype, "load", null);
AsyncLoader = __decorate([
    ui_attr_1.cmp,
    __metadata("design:paramtypes", [])
], AsyncLoader);
exports.AsyncLoader = AsyncLoader;
let AsyncLoaderUI = class AsyncLoaderUI extends React.Component {
    constructor(props) {
        super(props);
        this.msgCtr = React.createRef();
        this.msgRef = React.createRef();
        this.msgNum = 1;
        this.state = { error: null, errorInfo: null };
    }
    componentDidCatch(error, info) {
        this.setState({
            error: error,
            errorInfo: info
        });
    }
    componentDidMount() {
        this.props.loader.mustShowNotification.listen((msg) => {
            if (this.unmounted) {
                return;
            }
            this.msgNum++;
            let msgNum = this.msgNum;
            this.msgRef.current.innerHTML = '<div class="async-loader__msg_text">' + msg + '</div>';
            utils_1.removeClass(this.msgRef.current, "async-loader__msg_closed");
            utils_1.addClass(this.msgRef.current, "async-loader__msg_visible");
            utils_1.addClass(this.msgCtr.current, "async-loader__msgContainer-withMsg");
            setTimeout(() => {
                if (this.unmounted) {
                    return;
                }
                if (this.msgNum != msgNum) {
                    return;
                }
                utils_1.removeClass(this.msgCtr.current, "async-loader__msgContainer-withMsg");
            }, 2000);
            setTimeout(() => {
                if (this.unmounted) {
                    return;
                }
                if (this.msgNum != msgNum) {
                    return;
                }
                utils_1.addClass(this.msgRef.current, "async-loader__msg_closed");
            }, 400);
        });
    }
    componentWillUnmount() {
        console.log("LOADER-UNLISTEN");
        this.unmounted = true;
    }
    render() {
        if (this.state.error) {
            return React.createElement("div", null,
                React.createElement("h1", { className: "text-center" }, "Something went wrong"),
                React.createElement("details", { style: { whiteSpace: "pre-wrap" } },
                    this.state.error && this.state.error.toString(),
                    React.createElement("br", null),
                    this.state.errorInfo.componentStack));
        }
        const { className, loader, children } = this.props;
        const loaderEl = React.createElement(CircularProgress_1.default, { size: 80, className: "async-loader_spinner" });
        return React.createElement("div", { className: "async-loader host " + (className || ""), "data-ft": this.props["data-ft"] },
            React.createElement("div", { className: "async-loader__content", key: "content" }, children),
            React.createElement("div", { ref: this.msgCtr, className: "async-loader__msgContainer async-loader__msgContainer-loading-" + loader.loading + " async-loader__msgContainer-error-" + (loader.error && true) },
                React.createElement("div", { className: "async-loader__msg", ref: this.msgRef }),
                loader.error && React.createElement("div", { className: "load-error" }, errorModal_1.getErrorUi(this.props.loader.error)),
                loader.loading && !loader.error && loaderEl));
    }
};
AsyncLoaderUI = __decorate([
    mobx_react_1.observer,
    __metadata("design:paramtypes", [Object])
], AsyncLoaderUI);
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
    return entityStore_1.wait(time).then(() => p);
}
