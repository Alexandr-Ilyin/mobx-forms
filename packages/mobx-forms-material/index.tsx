import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { MultiSelectField } from '@mobx-forms/mobx-forms-models/lib/multiSelect';
import * as bp1 from "babel-polyfill";
import { renderTestElement } from "./testRunner/utils/testHelper";
import { SelectField } from '@mobx-forms/mobx-forms-models/lib/select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import { StrField } from '@mobx-forms/mobx-forms-models/lib/simpleFields';
import { MultiSelect } from './src/multiselect/multiSelect';
import { Select } from './src/select/select';
import { observable } from 'mobx';
import { ui } from './src/common/ui-attr';
import { BladePanel, pushBlade, trim } from './src/bladepanel/bladePanel';
import * as assert from 'assert';
import * as history from 'history';
import { List } from './src/list/list';

let h = history.createHashHistory();
window._xx = bp1;

let getOptions = async (query) => [
  { label: "Asd", value: "Sdf" },
  { label: "111", value: "qqq" }
]

describe("Multi select", function() {

  it("Simple input looks fine", async function() {
    let selectField = new StrField(null, { displayName: "F1" });
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
    assert.equal(trim("aavaa","a"),"v");
    assert.equal(trim("aav","a"),"v");
    assert.equal(trim("v","a"),"v");
    assert.equal(trim("vaa","a"),"v");
  });

  it("check blade panel routes.", function() {
    class C1 {render() { return <h1>C1</h1>; }}
    class C2 {render() { return <h1>C2</h1>; }}

    let panel = new BladePanel();
    panel.addRoute("c1", () => new C1());
    panel.addRoute("c2-{id}", () => new C2());
    panel.updatePanels("/b/c1/c2-111/be/");
    assert.equal(panel.panels.length,2);
    assert.equal(panel.panels[1].params["id"],"111");
    panel.updatePanels("/b/c1/c2-1/c1/be/");
    assert.equal(panel.panels.length,3);
  });

  it("list test", function() {
    interface User{
      name;
      lastName;
    }
    let list = new List<User>();
    list.addColumn("Name", u=>u.name);
    list.addColumn("Last name", u=>u.lastName);
    list.setData([
      {name:"Ivan", lastName:"Turgenev"},
      {name:"Alex", lastName:"Pushkin"}
    ]);
    renderTestElement(<div style={{width:"1000px",height:"700px",border:"1px solid gray"}}>{
      list.render()}</div>);
  });

  it("admin api test", function() {

    @ui
    class UserList {
      bladeStyle = {
        "minWidth":"600px",
        "flex" : "1"
      };

      render() {
        return <div style={{'background':''}}>          <b>panel</b>
            <button onClick={()=>{pushBlade("/users",h);}}>
              Add panel
            </button>
        </div>;
      }
    }

    @ui
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
    renderTestElement(<div style={{width:"1000px",height:"700px",border:"1px solid gray"}}>{app.render()}</div>);
     app.panel.connectToHistory(h);
     app.panel.pushRoute("users");
  });

});
