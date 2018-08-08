import * as React from 'react';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import TextField from '@material-ui/core/TextField';
import { cmp } from '../common/ui-attr';

@cmp
export class IntField extends FormField<number> {

  constructor(parent: IFieldContainer, cfg: FormFieldCfg<number>) {
    super(parent, cfg);
  }

  render(){
    return <TextField
      fullWidth={true}
      type="number"
      error={this.visibleError!=null}
      label={this.displayName}
      value={this.value || ""}
      onChange={(e:any)=> {
        this.touch();
        let value = parseInt(e.target.value,10);
        this.value = isNaN(value) ? null : value;
      }}
      margin="normal"/>
  }
}