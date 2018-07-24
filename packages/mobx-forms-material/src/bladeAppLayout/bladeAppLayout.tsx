import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { cmp, IComponent } from '../common/ui-attr';
import { observable } from 'mobx';
import { BladePanel } from '../bladepanel/bladePanel';
import { trim } from '../common/utils';

@cmp
export class AppMenuItem {
  private text;
  private icon;
  @observable isSelected;
  private parent: BladeAppLayout;
  private route: any;

  constructor(text, icon, route, parent: BladeAppLayout) {
    this.text = text;
    this.icon = icon;
    this.route = route;
    this.parent = parent;
  }

  render() {
    let style = {};
    if (this.parent.bladePanel.panels.length>0 &&
      trim(this.parent.bladePanel.panels[0].route.path,'/')===trim(this.route,'/'))
      style = {background:"white"};


    return <ListItem style={style} button onClick={() => {
      this.parent.bladePanel.push(this.route);
    }} className={"app-layout-menuItem"}>
      <ListItemIcon>
        {this.icon}
      </ListItemIcon>
      <ListItemText primary={this.text}/>
    </ListItem>;
  }
}

export class BladeAppLayout {
  menuItems: IComponent[] = [];
  bladePanel = new BladePanel();

  addItem(text, icon, route) {
    this.menuItems.push(new AppMenuItem(text, icon, route, this))
  }

  render() {
    return <div>
      <div className={"app-layout-appBar"}>
        <Typography variant="headline" gutterBottom style={{ color: 'white', padding: "15px 27px" }}>
          People core
        </Typography>

      </div>
      <Drawer className={"app-layout-drawer"}
              variant="permanent">
        <List>
          {this.menuItems.map(x => x.render())}
        </List>
      </Drawer>
      <div className={"app-layout-blades"}>
        {this.bladePanel.render()}
      </div>
    </div>;
  }
}

