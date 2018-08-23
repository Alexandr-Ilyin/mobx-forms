
import { DialogContext, IDialog, DialogService } from '../src/modals/dialogService';
import { Button, Dialog, DialogActions, DialogContent, Grid } from '@material-ui/core';
import * as React from 'react';
import * as assert from 'assert';
import equal = assert.equal;
import { BladePanel, pushBlade } from '../src/bladepanel/bladePanel';
import { cmp } from '../src/common/ui-attr';
import { renderTestElement } from '../testRunner/utils/testHelper';
import * as history from 'history';
import { StrField } from '../src/strField';
import { List, ListActions } from '../src/list/list';
import { Validation } from '../src/forms/validators';
import { FormBase } from '../src/forms/basic';

import { CardForm } from '../src/cardForm/cardForm';
import { BladeAppLayout } from '../src/bladeAppLayout/bladeAppLayout';
import { Inbox } from '@material-ui/icons';
import { PeopleOutline } from '@material-ui/icons';
import { MultiSelectFieldStr } from '../src/multiselect/multiSelectField';
import { DateField } from '../src/dateField';
import { wait } from '../src/common/wait';

let h = history.createHashHistory();
let getOptions = async (query) => [
  { label: "Option A", value: "A" },
  { label: "Option B", value: "B" },
  { label: "Option C", value: "C" }
]

interface User {
  name;
  lastName;
  id;
};
let arr: User[] = [];
for (let i = 0; i < 100; i++) {
  arr.push({
    name: "Ivan" + i,
    lastName: "Turgenev" + i,
    id: i
  });
}
;

describe("Blades", function() {

  it("can add panels dynamically", function() {

    @cmp
    class UserList {
      bladeStyle = {
        "minWidth": "600px",
        "flex": "1"
      };

      render() {
        return <div style={{ 'background': '' }}><b>panel</b>
          <br/>
          <br/>
          <button onClick={() => {pushBlade("/users", h);}}>
            Add panel
          </button>
        </div>;
      }
    }
    @cmp
    class Demo {
      bladeStyle = {
        "minWidth": "600px",
        "flex": "1"
      };

      render() {
        return <div style={{ 'background': '' }}><b>panel</b>
          <br/>
          <br/>
          Here we are
        </div>;
      }
    }
    @cmp
    class SampleApp1 {
      panel: BladePanel;

      constructor() {
        this.panel = new BladePanel();

        this.panel.addRoute({ path: "users", title: "users", makeCmp: () => new UserList() });
        this.panel.addRoute({ path: "demo", title: "demo", makeCmp: () => new Demo() });

      }

      render() {
        return this.panel.render();
      }
    }

    let app = new SampleApp1();
    renderTestElement(<div style={{ width: "1000px", height: "700px", border: "1px solid gray" }}>{app.render()}</div>);
    app.panel.connectToHistory(h);
    app.panel.push("users");
  });

  it("composite test", function() {
    let layout = new BladeAppLayout();
    let bp = layout.bladePanel;

    @cmp
    class UserDetails extends CardForm {
      userName = new StrField(this, { displayName: "Name" });
      lastName = new StrField(this, { displayName: "Last name", validations: [Validation.required() as any] });
      birthdaty = new DateField(this, { displayName: "Birthday"});
      options = new MultiSelectFieldStr(this, {
        displayName: "Options",
        validations: [Validation.required() as any],
        getOptions:getOptions,
      });


      renderActions(){
        return <Button size="large" color="primary"variant={'outlined'}>Save</Button>;
      }
      renderBody() {
        return <Grid spacing={8} >
          <Grid>{this.userName.render()}</Grid>
          <Grid>{this.lastName.render()}</Grid>
          <Grid>{this.options.render()}</Grid>
          <Grid>{this.birthdaty.render()}</Grid>
          <Grid><a onClick={()=>{
            bp.pushAfter("user-1",this);
          }}>Show manager</a></Grid>

        </Grid>;
      }
    }

    bp.addRoute({
      path: "user-{id}",
      makeCmp: (params) => {

        let userDetails = new UserDetails(null);
        userDetails.lastName.value = arr.find(x=>x.id==params.id).lastName;
        userDetails.userName.value = arr.find(x=>x.id==params.id).name;
        return userDetails;
      }
    });

    bp.addRoute({
      path: "users", makeCmp: () => {
        let list = new List<User>();
        list.addColumn("Name", u => u.name);
        list.addColumn("Last name", u => u.lastName);
        list.addRowAction(ListActions.Edit(u => bp.pushAfter("user-" + u.id, list)));

        let q = new StrField(null,{displayName:"Query"});
        list.addFilter(q);

        list.setSource({
          getData: async (t, s) => {
            await wait(800);
            return {
              items: arr.filter(x=>x.lastName.indexOf(q.value||'')>=0).slice(t, t + s),
              totalCount: arr.length
            };
          }
        });

        return list;
      }, style: { minWidth: "400px", flex: 1 }, title: "User list"
    });

    bp.push("users");


    layout.addItem("Users",<Inbox/>,"users");
    layout.addItem("Countries",<PeopleOutline/>,"countries");
    layout.addItem("Branches",<Inbox/>,"branches");
    layout.addItem("Positions",<Inbox/>,"positions");

    renderTestElement(<div style={{ width: "1000px", height: "700px", border: "1px solid gray", position:'absolute' }}>{
      layout.render()}</div>);
  });

});