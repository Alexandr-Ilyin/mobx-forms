import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { cmp } from '../common/ui-attr';
import { any } from 'prop-types';
import { addClass, removeArrayItem } from '../common/utils';
import { fadeIn } from '../animation/amim';
import { CSSTransition } from 'react-transition-group';

export interface Badge {
  render();
}

class BadgeState {
  @observable visible = false;
  b: Badge;
  num: number;

  constructor(b: Badge, n: number) {
    this.b = b;
    this.num = n;
  }
}

@cmp
export class LoaderBadge {
  render() {
    return <CircularProgress size={80}/>;
  }
}

@cmp
export class MessageBadge {
  private msg;

  constructor(msg) {
    this.msg = msg;
  }
  render() {
    return <div className="msg-badge">{this.msg}</div>;
  }
}

@cmp
export class BadgePanel {
  @observable badges: BadgeState[] = [];
  badgeNum = 0;

  addMessage<T>(message, p: Promise<T>): Promise<T> {
    return this.addBadge(new MessageBadge(message), p);
  }

  addLoading<T>(p: Promise<T>): Promise<T> {
    return this.addBadge(new LoaderBadge(), p);
  }

  addBadge<T>(b: Badge, p: Promise<T>): Promise<T> {
    let badgeState = new BadgeState(b, this.badgeNum++);
    this.badges.push(badgeState);
    let current = this.badges.find(x => x.visible);
    if (!current) {
      badgeState.visible = true;
    }

    let onFinished = () => {
      removeArrayItem(badgeState, this.badges);
      let next = this.badges.find(x => x.num >= badgeState.num && !x.visible);
      if (next)
        next.visible = true;
    };
    p.then(onFinished, onFinished);
    return p;
  }

  render(props) {
    props = props || {};
    let visible = this.badges.filter(x => x.visible);
    let showBg = visible.find(x => x.visible);
    return <div className="badgePanel">
      <div className="badgePanel-content">{props.children || null}</div>
      {fadeIn(showBg && [<div className="badgePanel-badges-bg"/>])}

      {fadeIn(visible.map(x =>
        <div className="badgePanel-badges" key={x.num}>
          <div className={"badgePanel-badgeItem"} key={x.num}>
            {x.b.render()}
          </div>
        </div>)
      )}

    </div>
  }
}

