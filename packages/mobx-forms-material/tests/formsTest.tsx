import { renderTestElement } from '../testRunner/utils/testHelper';

import * as React from 'react';
import {observer} from 'mobx-react';
import { StrField } from '../src/strField';
import { cmp } from '../src/common/ui-attr';
import { CardForm } from '../src/cardForm/cardForm';
import { Button, Paper } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { MultiSelectField, MultiSelectFieldSimple, MultiSelectFieldStr } from '../src/multiselect/multiSelectField';
import { SelectField, SelectFieldSimple, SelectFieldStr } from '../src/select/selectField';
import { BoolField } from '../src/boolField/boolField';
import equal = assert.equal;
import { wait } from '../src/common/wait';

let getOptions = async (query) => [
  { label: "Option A", value: "A" },
  { label: "Option B", value: "B" },
  { label: "Option C", value: "C" }
]

describe("Forms", function() {

  it("should show str fields.", function() {

    @cmp
    class UserForm extends CardForm {
      name = new StrField(this, { displayName: "name",defaultValue:"AA" });
      lastName = new StrField(this, { displayName: "last name" });

      protected async init(): Promise<any> {
        return wait(1000);
      }

      renderBody() {

        return <Grid container spacing={8}>
          <Grid item xs={12}>
            {this.name.render()}
          </Grid>
          <Grid item xs={12}>
            {this.lastName.render()}
          </Grid>
        </Grid>
      }

      renderActions() {
        return [
          <Button size="small">Save</Button>,
          <Button size="small">Close</Button>
        ]
      }
    }

    let f = new UserForm(null);
    renderTestElement(f.render());
  });

  it("should show multi select field.", async function() {
    @cmp
    class UserForm extends CardForm {
      positions = new MultiSelectFieldStr(this, {
        displayName: "Positions...",
        getOptions: getOptions
      });

      renderBody() {
        return <Paper style={{ height: "300px" }}>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              {this.positions.render()}
            </Grid>
          </Grid>
        </Paper>;
      }
    }

    let f = new UserForm(null);
    //await f.positions.setValueKeys(["A","B"]);
    renderTestElement(<Paper style={{ height: "300px" }}>{f.render()}</Paper>);
  });

  it("set empty value to required field, validate, check inValid.", async function() {
    @cmp
    class UserForm extends CardForm {
      positions = new SelectFieldStr(this, {
        displayName: "Positions...",
        getOptions: getOptions,
        required:true
      });

      renderBody() {
        return <Paper style={{ height: "300px" }}>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              {this.positions.render()}
            </Grid>
          </Grid>
        </Paper>;
      }
    }

    let f = new UserForm(null);
    //await f.positions.setValueKeys(["A","B"]);
    renderTestElement(<Paper style={{ height: "300px" }}>{f.render()}</Paper>);
    //await f.positions.setValueKey('B');
    //await wait(100);
    f.positions.setValue(null);
    equal(f.validate(), false);
  });


  it("should show select field.", async function() {
    @cmp
    class UserForm extends CardForm {
      position = new SelectFieldStr(this, {
        displayName: "Position", getOptions: getOptions
      });

      renderBody() {
        return <Paper style={{ height: "300px" }}>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              {this.position.render()}
            </Grid>
          </Grid>
        </Paper>;
      }
    }

    let f = new UserForm(null);
    //await f.positions.setValueKeys(["A","B"]);
    renderTestElement(<Paper style={{ height: "300px" }}>{f.render()}</Paper>);
  });

  it("should show multiple fields.", async function() {
    @cmp
    class UserForm extends CardForm {
      checkme = new BoolField(this, {
        displayName:"Check me",
        defaultValue:true
      });

      position = new SelectFieldSimple<boolean>(this, {
        displayName: "Position", getOptions: async (query) => [
          { label: "Option A", value: true },
          { label: "Option B", value: false }
        ]
      });
      positions = new MultiSelectFieldSimple<boolean>(this, {
        displayName: "Positions", getOptions: async (query) => [
          { label: "Option A", value: true },
          { label: "Option B", value: false }
        ]
      });

      positions2 = new MultiSelectField<string, string>(this, {
        getKey:x=>x,
        getLabel:x=>x,
        displayName: "Positions 2", getOptions: async (query) => [
         "A",
         "B"
        ]
      });
      renderBody() {
        return <Paper style={{ height: "300px" }}>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              {this.checkme.render()}
            </Grid>
            <Grid item xs={4}>
              {this.position.render()}
            </Grid>
            <Grid item xs={4}>
              {this.positions.render()}
            </Grid>
            <Grid item xs={4}>
              {this.positions2.render()}
            </Grid>
          </Grid>
        </Paper>;
      }
    }

    let f = new UserForm(null);
    await f.position.setValueKey(true);
    await f.positions2.setValueKeys(["A"]);
    renderTestElement(<div><Paper style={{ height: "300px" }}>{f.render()}
      <ObserveCmp>{()=>f.position.getValueKey() + typeof(f.position.getValueKey()) }</ObserveCmp>
      <ObserveCmp>{()=>f.positions.getValueKeys() + typeof(f.positions.getValueKeys()) }</ObserveCmp>
    </Paper></div>);
  });
});

@observer
class ObserveCmp extends React.Component<any,any>{
  render(){
    return this.props.children && (this.props.children as any)() || null;
  }
}