import { renderTestElement } from '../testRunner/utils/testHelper';
import { AsyncLoader } from '../src/loader/asyncLoader';
import { wait } from '../src/store/internals/entityStore';
import * as React from 'react';
import { StrField } from '../src/strField';
import { cmp } from '../src/common/ui-attr';
import { CardForm } from '../src/cardForm/cardForm';
import { Button, Paper } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { MultiSelectField } from '../src/multiselect/multiSelectField';
import { SelectField } from '../src/select/selectField';

let getOptions = async (query) => [
  { label: "Option A", value: "A" },
  { label: "Option B", value: "B" },
  { label: "Option C", value: "C" }
]

describe("Forms", function() {

  it("should show str fields.", function() {

    @cmp
    class UserForm extends CardForm {
      name = new StrField(this, { displayName: "name" });
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

  it("should show multi select field.",async function() {
    @cmp
    class UserForm extends CardForm {
      positions = new MultiSelectField(this, {
        displayName: "Positions...", getOptions: getOptions });

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

  it("should show select field.",async function() {
    @cmp
    class UserForm extends CardForm {
      position = new SelectField(this, {
        displayName: "Position", getOptions: getOptions });

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

});