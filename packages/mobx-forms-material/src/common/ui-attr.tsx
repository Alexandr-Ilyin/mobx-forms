import { observer } from 'mobx-react';
import * as React from 'react';

export function cmp(target) {
  let wrapped = target.prototype.render;

  @observer
  class CMP extends React.Component<any,any> {
    render() {
      return wrapped.apply(this.props.owner, this.props.args);
    }
  }

  target.prototype.render = function() {
    let args = arguments;
    return <CMP owner={this} args={args}/>;
  }
}

export interface IComponent {
  render();
}