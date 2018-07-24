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
import { List, ListActions } from '../src/list/list';

class User{
  name: string
  lastName: string
  id: number
};
let arr:User[] = [];
for (let i = 0; i < 100; i++) {
  arr.push({
    name: "Ivan" +i,
    lastName: "Turgenev" + i,
    id: i });
};

describe("Lists", function() {

  it("should shows and filters .", async function() {

    let list = new List<User>();
    list.addColumn("Name", u => u.name);
    list.addColumn("Last name", u => u.lastName);
    let query = new StrField(null,{displayName:"Query"});
    list.addFilter(query);

    await list.setSource({
      getData:async (t,s)=>{
        await wait(800);
        return {items:arr.filter(x=>x.lastName.indexOf(query.value ||'')>=0).slice(t,t+s), totalCount:arr.length};
      }
    });
    renderTestElement(list.render());
  });


});