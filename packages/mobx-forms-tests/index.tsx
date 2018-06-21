import { TestA } from "@mobx-forms/mobx-forms-models/lib/common";
import { Button, FormControl, InputLabel, MenuItem } from "@material-ui/core";
import * as React from 'react';
import { render } from 'react-dom';
import { MultiSelectField } from '@mobx-forms/mobx-forms-models/lib/fields';
import { MultiSelect } from '@mobx-forms/mobx-forms-material/src/multiselect/multiSelect';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import * as bp1 from "babel-polyfill";

console.log("hello world!!" + bp1);
let f = new MultiSelectField(null,"Sdf").options(async (query)=>[
  {label:"Asd",value:"Sdf"},
  {label:"111",value:"qqq"}
]);

class A {
  @observable B;
}
let a = new A();
let aa = new TestA();
aa.B = "345";
debugger
autorun(() => console.log("Aaa1" + aa.B));
aa.B="234111111111111111111111";



f.setValueKeys(["qqq"]);

setTimeout(()=>console.log("Aaa" + f.value),1000);
window["f"] = f;

@observer
export class Show extends React.Component<{field: MultiSelectField, classes}, any> {
  render(){
    return <div>V1:{this.props.field.value}</div>
  }
}
render(<div><MultiSelect field={f}></MultiSelect><Show field={f}/></div>, document.getElementById("main"));

import * as D from "react-dom";


