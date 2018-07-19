import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import * as bp1 from "babel-polyfill";
import { renderTestElement } from "./testRunner/utils/testHelper";
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import { StrField } from './src/strField';
import { MultiSelect } from './src/multiselect/multiSelect';
import { Select } from './src/select/select';
import { observable } from 'mobx';
import { cmp } from './src/common/ui-attr';
import { BladePanel, pushBlade, trim } from './src/bladepanel/bladePanel';
import * as assert from 'assert';
import * as history from 'history';
import { List, ListAction, ListActions } from './src/list/list';
import { Validation } from './src/forms/validators';
import { FormBase } from './src/forms/basic';
import { SelectField } from './src/select/selectField';
import './tests/asyncLoaderTests';

let h = history.createHashHistory();
window._xx = bp1;

let getOptions = async (query) => [
  { label: "Asd", value: "Sdf" },
  { label: "111", value: "qqq" }
]

describe("Multi select", function() {

  it("Simple input looks fine", async function() {
    let selectField = new Index(null, { displayName: "F1" });
    //await selectField.setValueKey("qqq");
    renderTestElement(<div style={{ margin: "50px" }}><FormControl>
      <InputLabel htmlFor="f1">MyOption </InputLabel>
      <Input id="f1"></Input>
    </FormControl>
    </div>)
  });
  it("Simple select looks fine", async function() {
    let selectField = new SelectField(null, { displayName: "F1", getOptions: getOptions });
    //await selectField.setValueKey("qqq");
    renderTestElement(<div style={{ margin: "50px" }}>
      <FormControl fullWidth={true}>
        <InputLabel htmlFor="f1">MyOption </InputLabel>
        <Select field={selectField}></Select>
      </FormControl>
    </div>)
  });

  // it("shows correcly", function() {
  //   let f = new MultiSelectField(null, { displayName: "F1", getOptions: getOptions });
  //   f.setValueKeys(["qqq"]);
  //   renderTestElement(<MultiSelect field={f}></MultiSelect>)
  // });

  it("check trim.", function() {
    assert.equal(trim("aavaa", "a"), "v");
    assert.equal(trim("aav", "a"), "v");
    assert.equal(trim("v", "a"), "v");
    assert.equal(trim("vaa", "a"), "v");
  });

  it("check blade panel routes.", function() {
    class C1 {render() { return <h1>C1</h1>; }}

    class C2 {render() { return <h1>C2</h1>; }}

    let panel = new BladePanel();
    panel.addRoute("c1", () => new C1());
    panel.addRoute("c2-{id}", () => new C2());
    panel.updatePanels("/b/c1/c2-111/be/");
    assert.equal(panel.panels.length, 2);
    assert.equal(panel.panels[1].params["id"], "111");
    panel.updatePanels("/b/c1/c2-1/c1/be/");
    assert.equal(panel.panels.length, 3);
  });

  it("form test", function() {
    @cmp
    class UserDetails extends FormBase {
      userName = new StrField(this,{displayName:"Name"});
      lastName = new StrField(this,{displayName:"Last name",validations:[Validation.required<string>()]});

      render() {
        return <div>
          {this.userName.render()}
          {this.lastName.render()}
        </div>;
      }
    }
    let u = new UserDetails();
    renderTestElement(<div style={{ width: "1000px", height: "700px", border: "1px solid gray" }}>{
      u.render()}</div>);


  });
  it("list test", function() {
    interface User {
      name;
      lastName;
      id;
    };

    @cmp
    class UserDetails extends FormBase {
      userName = new StrField(this,{displayName:"Name"});
      lastName = new StrField(this,{displayName:"Last name",validations:[Validation.required() as any]});

      render() {
        return <div>
          {this.userName.render()}
          {this.lastName.render()}
        </div>;
      }
    }

    let bp = new BladePanel();

    bp.addRoute({
      path: "user-{id}",
      makeCmp: () => new UserDetails()
    });

    bp.addRoute({
      path: "users", makeCmp: () => {
        let list = new List<User>();
        list.addColumn("Name", u => u.name);
        list.addColumn("Last name", u => u.lastName);
        list.addRowAction(ListActions.Edit(u => bp.pushAfter("user-" + u.id,list)));
        list.setData([
          { name: "Ivan", lastName: "Turgenev", id: 1 },
          { name: "Alex", lastName: "Pushkin", id: 2 }
        ]);
        return list;
      }, style: { minWidth: "500px", flex: 1 }, title: "User list"
    });

    bp.push("users");

    renderTestElement(<div style={{ width: "1000px", height: "700px", border: "1px solid gray" }}>{
      bp.render()}</div>);
  });

  it("admin api test", function() {

    @cmp
    class UserList {
      bladeStyle = {
        "minWidth": "600px",
        "flex": "1"
      };

      render() {
        return <div style={{ 'background': '' }}><b>panel</b>
          <button onClick={() => {pushBlade("/users", h);}}>
            Add panel
          </button>
        </div>;
      }
    }

    @cmp
    class SampleApp1 {
      panel: BladePanel;

      constructor() {
        this.panel = new BladePanel();
        this.panel.addRoute("users", () => new UserList());
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

});

