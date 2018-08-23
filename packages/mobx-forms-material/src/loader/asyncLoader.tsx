import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';

import { observer } from 'mobx-react';
import { cmp } from '../common/ui-attr';
import { DialogService } from '../modals/dialogService';
import { ErrorModal, getErrorUi } from './errorModal';
import { trackAsync } from '../common/trackAsync';
import { Queue } from '../common/queue';
import CircularProgress from '@material-ui/core/CircularProgress';
import { AppEvent } from '../common/events';
import { addClass, removeClass } from '../common/utils';
import { BadgePanel } from '../badgePanel/badgePanel';
import { ErrorContainer } from '../errorContainer/errorContainer';
import { wait } from '../common/wait';

@cmp
export class AsyncLoader {
  badgePanel = new BadgePanel();

  wait<T>(promise: (()=>Promise<T>)|Promise<T>, notificationMsg?): Promise<T> {
    if (typeof promise!='function')
      return this.waitPromise(promise as Promise<T>, notificationMsg);
    else
      return this.waitPromise(Promise.resolve().then(promise), notificationMsg);
  }

  @trackAsync()
  waitPromise<T>(promise: Promise<T>, notificationMsg?): Promise<T> {
    let slowPromise = this.badgePanel.addLoading(slowUiPromise<T>(promise));
    return slowPromise.then((x) => {
      if (notificationMsg) {
        return this.badgePanel.addMessage(notificationMsg, wait(1000)).then(()=>x);
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
    DialogService.show(new ErrorModal(err));
  }

  render(children) {
    return <ErrorContainer>{this.badgePanel.render(
      {children:children})}
      </ErrorContainer>;
  }
}

function slowUiPromise<T>(p) :Promise<T>{
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

    p.then(function(r) {
        result = r;
        isOk = true;
        tryFinish();
      },
      function(err) {
        error = err;
        isFail = true;
        tryFinish();
      });

    setTimeout(function() {
      isFast = false;
    }, 300);

    setTimeout(function() {
      hasWaited = true;
      tryFinish();
    }, 900);

  });
}

function slowPromise(p, time?) {
  if (time == null) {
    time = 700;
  }
  if (time === 0) {
    return Promise.resolve().then(() => p);
  }
  return wait(time).then(() => p);
}
