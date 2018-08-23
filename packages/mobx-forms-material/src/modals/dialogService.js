"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDOM = require("react-dom");
const defer_1 = require("../common/defer");
let killModals = [];
function closeAllModals() {
    killModals.forEach(x => x());
}
exports.closeAllModals = closeAllModals;
window["closeAllModals"] = closeAllModals;
let lbNum = 0;
class DialogService {
    static show(cmp) {
        return new Promise((resolve, reject) => {
            let div = document.createElement("div");
            div.setAttribute("lbNum", "" + (++lbNum));
            let killModal = () => {
                ReactDOM.unmountComponentAtNode(div);
                div.parentElement.removeChild(div);
                killModals = killModals.filter(x => x !== killModal);
                console.log("REMOVED LIGHTBOX!");
            };
            let closeFunc = (r) => {
                let def = new defer_1.Defer();
                console.log("Queued close LB");
                setTimeout(() => {
                    resolve(r);
                    killModal();
                    def.resolve();
                });
            };
            let cancelFunc = () => {
                let def = new defer_1.Defer();
                console.log("Queued close LB");
                setTimeout(() => {
                    reject("Modal: Cancelled by a user.");
                    killModal();
                    def.resolve();
                });
            };
            document.body.appendChild(div);
            ReactDOM.render(cmp.render({
                complete: closeFunc,
                cancel: cancelFunc
            }), div);
            killModals.push(killModal);
        });
    }
}
exports.DialogService = DialogService;
