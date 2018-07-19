import * as React from "react";
import * as  ReactDOM from "react-dom";
import { Defer } from '../store/internals/entityStore';

let killModals = [];

export function closeAllModals() {
  killModals.forEach(x => x());
}

window["closeAllModals"] = closeAllModals;
let lbNum = 0;

export class ModalService {
  static show<T>(cmp:IDialog<T>): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let div = document.createElement("div");
      div.setAttribute("lbNum", "" + (++lbNum));
      let killModal = () => {
        ReactDOM.unmountComponentAtNode(div);
        div.parentElement.removeChild(div);
        killModals = killModals.filter(x => x !== killModal);
        console.log("REMOVED LIGHTBOX!");

      };
      let closeFunc = (r) => {
        let def = new Defer();
        console.log("Queued close LB");
        setTimeout(() => {
          resolve(r);
          killModal();
          def.resolve();
        });
      };
      let cancelFunc = () => {
        let def = new Defer();
        console.log("Queued close LB");
        setTimeout(() => {
          reject("Modal: Cancelled by a user.");
          killModal();
          def.resolve();
        });
      };
      document.body.appendChild(div);
      ReactDOM.render(cmp.render({
        complete:closeFunc,
        cancel:cancelFunc
      }), div);
      killModals.push(killModal);
    });
  }
}

export interface DialogContext<TResult> {
  cancel:()=>void;
  complete(v:TResult);
}

export interface IDialog<TResult> {
  render(ctx: DialogContext<TResult>);
}
