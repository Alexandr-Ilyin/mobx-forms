import Scrollbars from 'react-custom-scrollbars';
import * as  React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { IComponent, cmp } from '../common/ui-attr';
import { MatchRule } from './pathMathing';
import { addClass, getParent, removeClass, scrollToView, scrollXToEnd, trim } from '../common/utils';
import RemoveCircle from '@material-ui/icons/RemoveCircleOutline';
import Close from '@material-ui/icons/Close';
import * as DOM from 'react-dom';

class BladeMatchPanel {
  route: BladeRouteCfg;
  cmp: IComponent;
  segment: string;
  params: any;
  @observable collapsed: boolean;
}

interface BladeRouteCfg {
  makeCmp: (params?) => IComponent;
  path: any;
  style?: any;
  title?: any;
  isDefault?: boolean;
}

interface InternalBladeRouteCfg extends BladeRouteCfg {
  match: MatchRule
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

@cmp
export class BladePanel {
  @observable private _panels: BladeMatchPanel[] = [];
  @observable private rules: InternalBladeRouteCfg[] = [];
  private history: any;

  get panels(): BladeMatchPanel[] {
    return this._panels;
  }

  addRoute(cfg: BladeRouteCfg) {
    let path = cfg.path = "/" + trim(cfg.path, "/") + "/";
    cfg.style = { minWidth: "400px", float: 1, ...cfg.style };
    let inner = { ...cfg, match: new MatchRule(path) };
    this.rules.push(inner);
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
      console.log(new Error("Unknown segment " + segment));
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

  replace(segment, replaced) {
    let newSegments = [];
    let found = false;
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];
      if (panel.cmp != replaced) {
        newSegments.push(trim(panel.segment, "/"));
      }
      else {
        found = true;
        break;
      }
    }
    newSegments.push(segment);
    this.push(newSegments.join("/"));
    if (!found) {
      console.log("after BladePanel not found ", afterCmp);
    }
  }

  pushAfter(segment, afterCmp) {
    let newSegments = [];
    let found = false;
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];
      if (panel.cmp != afterCmp) {
        newSegments.push(trim(panel.segment, "/"));
      }
      else {
        found = true;
        newSegments.push(trim(panel.segment, "/"));
        break;
      }
    }
    newSegments.push(segment);
    this.push(newSegments.join("/"));
    if (!found) {
      console.log("after BladePanel not found ", afterCmp);
    }
  }

  push(path) {
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
    if (matches.length==0)
    {
      let defaultRule = this.rules.find(x => x.isDefault);
      if (defaultRule) {
        matches = this.getMatches('/b/' + trim(defaultRule.path,'/') +'/be/');
      }
    }
    for (let i = 0; i < Math.min(matches.length, this._panels.length); i++) {
      const match = matches[i];

      if (this._panels[i].segment == match["segment"]) {
        validCount++;
        if (this._panels[i].cmp['updateParams']) {
          this._panels[i].cmp['updateParams'](match);
        }
      }
    }
    let numberToPop = this._panels.length - validCount;
    for (let i = 0; i < numberToPop; i++) {
      this._panels.pop();
    }
    for (let i = validCount; i < matches.length; i++) {
      const match = matches[i];
      let rule = this.rules.find(x => x.path == match.path);
      this._panels.push({
        route: rule,
        cmp: rule.makeCmp(match),
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
        newSegments.push(trim(panel.segment, "/"));
      }
      else {
        found = true;
        break;
      }
    }
    if (found) {
      this.push(newSegments.join("/"));
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
          let portal = getParent(panel, "blade-portal");
          setTimeout(() => {
            scrollToView(panel, portal);
          }, 500);
        }}>
          {this.getTitle(x)}
        </div>
      </div>;
    }

    return <div className={"blade-panel " + "blade-panel-collapsed-" + x.collapsed}
                style={Object.assign({}, x.cmp['bladeStyle'], x.route.style)}>
      <div className="blade-panel-title">
        {this.getTitle(x)}
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
        <Scrollbars>
          {x.cmp.render()}
        </Scrollbars>
      </div>
    </div>
  }

  private getTitle(x: BladeMatchPanel) {
    return (x.cmp["getTitle"] && x.cmp["getTitle"]()) || (x.route.title) || "Untitled";
  }
}



