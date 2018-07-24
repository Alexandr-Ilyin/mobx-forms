import * as React from 'react';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import TextField from '@material-ui/core/TextField';
import { cmp } from '../common/ui-attr';

@cmp
export class DateField extends FormField<string> {

  constructor(parent: IFieldContainer, cfg: FormFieldCfg<string>) {
    super(parent, cfg);
  }

  render(){
    return <TextField
      fullWidth={true}
      type="date"
      error={this.visibleError!=null}
      label={this.displayName}
      value={this.value || ""}
      InputLabelProps={{
        shrink: true,
      }}
      onChange={(e:any)=> {
        this.touch();
        this.value = e.target.value;
      }}
      margin="normal"/>
  }
}