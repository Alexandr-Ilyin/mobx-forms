import { observer } from 'mobx-react';
import * as React from 'react';

export function ui(target) {
  let wrapped = target.prototype.render;

  @observer
  class CMP extends React.Component<any,any> {
    render() {
      return wrapped.apply(this.props.owner, arguments);
    }
  }

  target.prototype.render = function() {
    return <CMP owner={this}/>;
  }
}

export interface IComponent {
  bladeStyle?: any;
  render();


}