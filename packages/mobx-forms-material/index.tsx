import { Button, FormControl, InputLabel, MenuItem } from "@material-ui/core";
import * as React from 'react';
import { render } from 'react-dom';
import { MultiSelectField } from 'mobx-forms-models/lib/fields';
import { MultiSelect } from './src/multiselect/multiSelect';
import * as bp1 from "babel-polyfill";


console.log("hello world!!" + bp1);
let f = new MultiSelectField(null,"Sdf").options(async (query)=>[
  {label:"Asd",value:"Sdf"},
  {label:"111",value:"qqq"}
]);

f.setValueKeys(["qqq"]);
window["f"] = f;

@observer
export class Show extends React.Component<{field: MultiSelectField, classes}, any> {
  render(){
    return <div>V:{this.props.field.value}</div>
  }
}
render(<div><MultiSelect field={f}></MultiSelect><Show field={f}/></div>, document.getElementById("main"));

import * as D from "react-dom";

