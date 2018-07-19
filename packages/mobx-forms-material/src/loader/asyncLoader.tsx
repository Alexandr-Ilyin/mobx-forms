import { observable } from 'mobx';
import { Queue } from '@material-ui/icons';
import { observer } from 'mobx-react';
import { cmp } from '../common/ui-attr';
import { ModalService } from '../modals/modalService';
import { ErrorModal } from './errorModal';

@cmp
export class AsyncLoader {
  @observable loaded: boolean;
  @observable loading: boolean;
  @observable starting: boolean;
  @observable error: any;
  getter: () => any;
  queue = new Queue();

  constructor(loading?: boolean) {
    if (loading !== undefined) {
      this.loading = loading;
    }
    this.starting = true;
    setTimeout(() => this.starting = false, 1000);
  }

  @trackAsync()
  refresh(): Promise<any> {
    this.starting = false;
    if (!this.getter) {
      return Promise.resolve();
    }
    this.loading = true;
    let loadPromise = this.getter();
    return this.queue.enqueue(() => {
      return Promise.resolve().then(() => loadPromise);
    }).then(() => {
      if (this.queue.isEmpty()) {
        this.loading = false;
        this.loaded = true;
      }
    }, err => {
      console.log("Error:");
      console.log(err);
      if (this.queue.isEmpty()) {
        this.loading = false;
        this.loaded = true;
        this.error = err;
      }
      return Promise.reject(err);
    });
  }

  @trackAsync()
  wait<T>(promise: ((() => Promise<T>) | Promise<T>)): Promise<T> {
    let p;
    if (arguments.length === 1) {
      p = arguments[0];
    }
    if (typeof promise != "function")
      p = () => promise;

    this.loading = true;

    return this.queue.enqueue(p).then((x) => {
      this.loaded = true;
      if (this.queue.isEmpty())
        this.loading = false;
      return x;
    }, err => {
      console.log("Error:");
      console.log(err);

      ModalService.show(new ErrorModal(err));
      if (this.queue.isEmpty()) {
        this.loading = false;
        this.error = err;
      }
    });
  }

  @trackAsync()
  load(getter: () => any): Promise<any> {
    this.getter = getter;
    this.loading = true;
    return this.refresh();
  }

  render(children){
    return <AsyncLoaderUI loader={this}>{children}</AsyncLoaderUI>;
  }
}

@observer
class AsyncLoaderUI extends React.Component<{ loader: AsyncLoader, className?: string,
  onMounted?: () => any }, any> {

  constructor(props) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error, info) {
    this.setState({
      error: error,
      errorInfo: info
    });
  }

  componentDidUpdate() {
    const {loader, onMounted} = this.props;
    if (loader.loaded && onMounted) {
      onMounted();
    }
  }

  render() {
    if (this.state.error) {
      return <div>
        <h1 className="text-center">Something went wrong</h1>
        <details style={{whiteSpace: "pre-wrap"}}>
          {this.state.error && this.state.error.toString()}
          <br/>
          {this.state.errorInfo.componentStack}
        </details>
      </div>;
    }

    const {className, loader, children} = this.props;
    const loaderEl = <div className={"host host-loading " + (className || "")}><Loader noTimer={true}/></div>;
    const style = loader.loading || loader.error ? {display: "none"} : {};

    return <div className={"host " + (className || "")} data-ft={this.props["data-ft"]}>
      {loader.loading && !loader.error && loaderEl}
      {loader.error && <div className="load-error">{getErrorUi(this.props.loader.error)}</div>}
      <div className="async-loader__content" style={style} key="content">{loader.loaded && children}</div>
    </div>;

  }
}
