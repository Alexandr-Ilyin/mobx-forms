import { observer } from 'mobx-react';
import * as React from 'react';

let __cmpId = 0;
export function cmp(target) {
  let wrapped = target.prototype.render;

  @observer
  class CMP extends React.Component<any,any> {
    render() {
      return wrapped.apply(this.props.owner, this.props.args);
    }
  }


  if (target['name'])
    CMP['displayName'] = target['name'];

  target.prototype.render = function() {
    let args = arguments;
    if (this['__cmpId'])
      this['__cmpId'] ='CMP'+ __cmpId++;
    return <CMP owner={this} args={args} key={this.__cmpId}/>;
  }
}

export interface IComponent {
  render();
}