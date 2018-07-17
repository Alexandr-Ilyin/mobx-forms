import * as  React from 'react';
import { Async } from 'react-select'
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { IComponent, ui } from '../common/ui-attr';
import { MatchRule } from './pathMathing';
import { addClass, getParent, removeClass, scrollToView, scrollXToEnd, trim } from '../common/utils';
import RemoveCircle from '@material-ui/icons/RemoveCircleOutline';
import Close from '@material-ui/icons/Close';
import * as DOM from 'react-dom';

class BladeMatchPanel {
  rule: BladeMatchRule;
  cmp: IComponent;
  segment: string;
  params: any;
  @observable collapsed: boolean;
}

class BladeMatchRule {
  match: MatchRule;
  makeCmp: () => IComponent;
  path: any;
}

export function pushBlade(blade, history) {
  let pathname = history.location.pathname;
  let bladesPath = /\/b\/(.*)\/be\//.exec(pathname);
  if (!bladesPath) {
    return;
  }
  let segments = bladesPath[1].split('/');
  segments.push(trim(blade, '/'));
  history.push('/b/' + segments.join('/') + '/be/');
}

@ui
export class BladePanel {
  @observable private _panels: BladeMatchPanel[] = [];
  @observable private rules: BladeMatchRule[] = [];
  private history: any;

  get panels(): BladeMatchPanel[] {
    return this._panels;
  }

  addRoute(path, makeCmp) {
    path = "/" + trim(path, "/") + "/";
    this.rules.push({
      makeCmp: makeCmp,
      path: path,
      match: new MatchRule(path)
    });
  }

  private getMatches(path) {
    let bladesPath = /\/b\/(.*)\/be\//.exec(path);
    if (!bladesPath) {
      return [];
    }
    let segments = bladesPath[1].split('/');
    let getMatch = segment => {
      for (let j = 0; j < this.rules.length; j++) {
        const route = this.rules[j];
        let m = route.match.getMatchParams("/" + segment + "/");
        if (m) {
          return m;
        }
      }
      console.log(new Error("Unknown segment"));
    };
    return segments.map(x => getMatch(x)).filter(x => x);
  }

  connectToHistory(history) {
    history.listen((e) => {
      this.updatePanels(e.pathname);
    });
    this.history = history;
    this.updatePanels(history.location.pathname);
  }

  pushRoute(path) {
    let fullPath = "/b/" + trim(path, '/') + "/be/";
    if (this.history) {
      this.history.push(fullPath);
    }
    else {
      this.updatePanels(fullPath);
    }
  }

  @action
  updatePanels(path) {
    let matches = this.getMatches(path);
    let validCount = 0;
    for (let i = 0; i < Math.min(matches.length, this._panels.length); i++) {
      const match = matches[i];
      if (this._panels[i].rule.path == match["path"]) {
        validCount++;
        if (this._panels[i].cmp['updateParams']) {
          this._panels[i].cmp['updateParams'](match);
        }
      }
    }

    let numberToPop = this._panels.length-validCount;

    for (let i = 0; i < numberToPop; i++) {
      this._panels.pop();
    }
    for (let i = validCount; i < matches.length; i++) {
      const match = matches[i];
      let rule = this.rules.find(x => x.path == match.path);
      this._panels.push({
        rule: rule,
        cmp: rule.makeCmp(),
        params: match,
        collapsed: false,
        segment: match.segment
      });
    }
  }

  render() {
    return <div className="blade-portal">
      {this._panels.map(x => <PanelUi model={x} panel={this}/>)}
    </div>;
  }

  remove(e: BladeMatchPanel) {
    let newSegments = [];
    let found = false;
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];
      if (panel != e) {

        newSegments.push(trim(panel.segment,"/"));
      }
      else {
        found = true;
        break;
      }
    }
    if (found) {

      this.pushRoute(newSegments.join("/"));
    }
  }
}

@observer
class PanelUi extends React.Component<{
  model: BladeMatchPanel,
  panel: BladePanel
}, any> {

  componentDidMount(): void {
    let el = DOM.findDOMNode(this);
    scrollXToEnd(getParent(el, "blade-portal"));
  }

  render() {
    let x = this.props.model;
    if (x.collapsed) {
      return <div className={"blade-panel " + "blade-panel-collapsed-" + x.collapsed}>
        <div className="blade-panel-title" onClick={(e: any) => {
          let panel = getParent(e.target, "blade-panel");
          x.collapsed = false;
          let portal = getParent(panel, "blade-portal")
          setTimeout(() => {
            scrollToView(panel, portal);
          }, 500);
        }}>
          Title 1
        </div>
      </div>;
    }

    return <div className={"blade-panel " + "blade-panel-collapsed-" + x.collapsed} style={x.cmp.bladeStyle || {}}>
      <div className="blade-panel-title">
        Title 1
        <div className="blade-panel-icons">
          <a href="javascript:;" onClick={(e: any) => {
            let parentElement = getParent(e.target, "blade-panel");
            parentElement.style["min-width"] = parentElement.outerWidth;
            x.collapsed = true;
            return;
          }}><RemoveCircle/></a>

          <a href="javascript:;" onClick={(e: any) => {
            let parentElement = getParent(e.target, "blade-panel");
            this.props.panel.remove(x);
          }}>
            <Close/>
          </a>

        </div>
      </div>
      <div className="blade-panel-body">
        {x.cmp.render()}
      </div>
    </div>
  }
}



