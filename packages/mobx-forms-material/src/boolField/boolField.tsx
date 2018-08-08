import * as React from 'react';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import { cmp } from '../common/ui-attr';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

@cmp
export class BoolField extends FormField<boolean> {

  constructor(parent: IFieldContainer, cfg: FormFieldCfg<boolean>) {

    if (!cfg.defaultValue)
      cfg.defaultValue = false;
    super(parent, cfg);
    //this.setValue(false);
  }

  render() {
    return <FormControlLabel
      control={
        <Checkbox
          checked={this.value}
          onChange={(e:any)=>{this.value = e.target.checked}}
          color="primary"
        />
      }
      label={this.displayName}
    />
  }
}