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
import { wait } from '../store/internals/entityStore';




@cmp
export class AsyncLoader {
  @observable loading: boolean;
  queue = new Queue();
  mustShowNotification: AppEvent<string>;

  constructor() {
    this.mustShowNotification = new AppEvent<string>();
  }

  @trackAsync()
  wait<T>(promise: ((() => Promise<T>) | Promise<T>), notificationMsg?): Promise<T> {
    let wrappedPromise: any = promise;
    if (typeof promise != "function") {
      wrappedPromise = () => slowUiPromise(promise as any);
    }
    else {
      wrappedPromise = () => slowUiPromise(promise()) as any;
    }

    this.loading = true;
    return this.queue.enqueue(wrappedPromise as any).then((x) => {
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
    DialogService.show(new ErrorModal(err));
  }

  @trackAsync()
  load(getter: () => any): Promise<any> {
    this.getter = getter;
    this.loading = true;
    return this.refresh();
  }

  render(children) {
    return <AsyncLoaderUI loader={this}>{children}</AsyncLoaderUI>;
  }
}

@observer
class AsyncLoaderUI extends React.Component<{
    loader: AsyncLoader,
    className?: string,
  }, any> {

  msgCtr = React.createRef() as any;
  msgRef = React.createRef() as any;
  private unmounted: boolean;
  private msgNum = 1;

  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, info) {
    this.setState({
      error: error,
      errorInfo: info
    });
  }

  componentDidMount(): void {
    this.props.loader.mustShowNotification.listen((msg) => {
      if (this.unmounted) {
        return;
      }
      this.msgNum++;
      let msgNum = this.msgNum;
      this.msgRef.current.innerHTML = '<div class="async-loader__msg_text">' + msg + '</div>';
      removeClass(this.msgRef.current, "async-loader__msg_closed");
      addClass(this.msgRef.current, "async-loader__msg_visible");
      addClass(this.msgCtr.current, "async-loader__msgContainer-withMsg");

      setTimeout(() => {
        if (this.unmounted) {
          return;
        }
        if (this.msgNum != msgNum) {
          return;
        }
        removeClass(this.msgCtr.current, "async-loader__msgContainer-withMsg");
      }, 2000);

      setTimeout(() => {
        if (this.unmounted) {
          return;
        }
        if (this.msgNum != msgNum) {
          return;
        }
        addClass(this.msgRef.current, "async-loader__msg_closed");
      }, 400);
    });
  }

  componentWillUnmount(): void {
    console.log("LOADER-UNLISTEN");
    this.unmounted = true;
  }

  render() {
    if (this.state.error) {
      return <div>
        <h1 className="text-center">Something went wrong</h1>
        <details style={{ whiteSpace: "pre-wrap" }}>
          {this.state.error && this.state.error.toString()}
          <br/>
          {this.state.errorInfo.componentStack}
        </details>
      </div>;
    }

    const { className, loader, children } = this.props;
    const loaderEl = <CircularProgress size={80} className={"async-loader_spinner"}/>;
    return <div className={"async-loader host " + (className || "")} data-ft={this.props["data-ft"]}>
      <div className="async-loader__content" key="content">{children}</div>
      <div ref={this.msgCtr}
           className={"async-loader__msgContainer async-loader__msgContainer-loading-" + loader.loading + " async-loader__msgContainer-error-" + (loader.error && true)}>
        <div className="async-loader__msg" ref={this.msgRef}/>
        {loader.error && <div className="load-error">{getErrorUi(this.props.loader.error)}</div>}
        {loader.loading && !loader.error && loaderEl}
      </div>
    </div>;

  }
}

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
