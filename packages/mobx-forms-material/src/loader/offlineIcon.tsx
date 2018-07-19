import * as React from 'react';

export class OfflineErrorIcon extends React.Component<any, any> {
  render() {
    return <div className="offlineIcon">
      <i className="fa fa-wifi offlineIcon-wifi" aria-hidden="true"></i>
      <i className="fa fa-exclamation-triangle offlineIcon-err" aria-hidden="true"></i>
    </div>;
  }
}

