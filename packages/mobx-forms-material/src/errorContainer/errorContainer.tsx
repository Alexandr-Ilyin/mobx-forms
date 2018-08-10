import { addClass, removeClass } from '../common/utils';
import { getErrorUi } from '../loader/errorModal';
import { AsyncLoader } from '../loader/asyncLoader';
import  * as React from 'React';


export class ErrorContainer extends React.Component<any, any> {
  componentDidCatch(error, info) {
    this.setState({
      error: error,
      errorInfo: info
    });
  }

  render() {
    if (this.state && this.state.error) {
      return <div>
        <h1 className="text-center">Something went wrong</h1>
        <details style={{ whiteSpace: "pre-wrap" }}>
          {this.state.error && this.state.error.toString()}
          <br/>
          {this.state.errorInfo && this.state.errorInfo.componentStack}
        </details>
      </div>;
    }
    return this.props.children;
  }
}