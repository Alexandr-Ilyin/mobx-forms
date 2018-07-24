import * as  React  from 'react';
import {Async} from 'react-select'
import {observer} from 'mobx-react'
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CancelIcon from '@material-ui/icons/Cancel';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ClearIcon from '@material-ui/icons/Clear';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import MenuItem from '@material-ui/core/MenuItem';
import { toJS } from 'mobx';
import { MultiSelectField } from './multiSelectField';
import * as PropTypes  from 'prop-types';

class Option extends React.Component<any,any> {
  handleClick = event => {
    this.props.onSelect(this.props.option, event);
  };
  render() {
    const { children, isFocused, isSelected, onFocus } = this.props;
    return (
      <MenuItem
        onFocus={onFocus}
        selected={isFocused}
        onClick={this.handleClick}
        component="div"
        style={{
          fontWeight: isSelected ? 500 : 400,
        }}>
        {children}
      </MenuItem>
    );
  }
}

function SelectWrapped(props) {
  const { classes, ...other } = props;
  function renderValue(valueProps){
    {
      const { value, children, onRemove } = valueProps;
      const onDelete = event => {
        event.preventDefault();
        event.stopPropagation();
        onRemove(value);
      };
      if (onRemove) {
        return (
          <Chip
            tabIndex={-1}
            label={children}
            className={classes.chip}
            deleteIcon={<CancelIcon className={"Select-value-icon"} onTouchEnd={onDelete} onMouseDown={onDelete} />}
            onDelete={onDelete}
          />
        );
      }
      return <div className="Select-value">{children}</div>;
    }
  }
  return (
    <Async
        //isLoading={this.props.field.loader.loading || undefined}
        async={true} cache={{}} loadOptions={(query,cb)=>{
          Promise.resolve().then(()=>props.field.getOptions('')).then(res=>{
            cb(null, {options:res})
          }, err=>{
            console.log(err);
          });
        }}
        onChange={e=>{
          debugger
          this.props.field.touch();

          this.props.field.value=e;
        }}
        multi={true}
        value={props.field.value}
        optionComponent={Option}
        noResultsText={<Typography>{'No results found'}</Typography>}
        arrowRenderer={arrowProps => {        return arrowProps.isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;      }}
        clearRenderer={() => <ClearIcon />}
        valueComponent={valueProps => renderValue(valueProps)}
        {...other}
      />
  );
}

@observer
export class InnerSelector extends React.Component<{field: MultiSelectField, classes}, any> {
  static contextTypes = { muiFormControl: PropTypes.object };
  static childContextTypes = { muiFormControl: PropTypes.object };
  private muiFormControl: any;

  constructor(props, context: any) {
    super(props);
    this.muiFormControl = context.muiFormControl;
  }
  componentDidMount(): void {
    this.updateDirty();
  }

  updateDirty() {
    if (this.muiFormControl) {
      if (!this.props.field.isEmpty()) {
        this.muiFormControl.onFilled();
      }
      else {
        this.muiFormControl.onEmpty();
      }
    }
  }

  render() {

    return <Input
      fullWidth
      onChange={(v:any)=>{
        this.props.field.setValue(v);
        this.updateDirty()
      }}

      value={(this.props.field.isEmpty()?'':this.props.field.value.map(x=>x.value)) as any}
      inputComponent={SelectWrapped}
      inputProps={{
        simpleValue: false,
        placeholder: '',
        classes: this.props.classes,
        field:this.props.field,
        muiFormControl :this.muiFormControl
      }}
    />
  }
}

export const MultiSelect  = withStyles(styles as any)(InnerSelector);
