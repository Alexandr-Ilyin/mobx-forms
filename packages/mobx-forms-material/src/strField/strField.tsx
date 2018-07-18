import { FormField } from '../forms/common';
import TextField from '@material-ui/core/TextField';
import { ui } from '../common/ui-attr';

@ui
export class StrField extends FormField<string> {
  render(){
    return <TextField

      label={this.displayName}
      value={this.value}
      onChange={(v:any)=> {
        this.value = v;
        this.touch();
      }}
      margin="normal"/>
  }
}