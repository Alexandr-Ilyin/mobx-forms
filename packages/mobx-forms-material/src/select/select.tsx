import * as  React from 'react';

import * as PropTypes  from 'prop-types'
import { Async } from 'react-select'
import { observer } from 'mobx-react'
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CancelIcon from '@material-ui/icons/Cancel';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ClearIcon from '@material-ui/icons/Clear';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import Select from 'react-select';
import MenuItem from '@material-ui/core/MenuItem';
import { toJS } from 'mobx';
import { SelectField } from './selectField';

class Option extends React.Component<any, any> {
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

@observer
export class SelectWrapped extends React.Component<{ field: SelectField, classes, placeholder }, any> {
  static contextTypes = { muiFormControl: PropTypes.object };
  static childContextTypes = { muiFormControl: PropTypes.object };
  muiFormControl: any;

  constructor(props: { field: SelectField; classes; placeholder, muiFormControl }, context: any) {
    super(props, context);
    this.muiFormControl = props.muiFormControl || context.muiFormControl ;
  }

  componentDidMount(): void {
    this.updateDirty();
  }

  updateDirty() {
    if (this.muiFormControl) {
      if (this.props.field.getValue()) {
        this.muiFormControl.onFilled();
      }
      else {
        this.muiFormControl.onEmpty();
      }
    }
  }

  render() {
    let props = this.props;
    const { classes, ...other } = props;

    let renderValue = (valueProps) => {
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
              deleteIcon={<CancelIcon className={"Select-value-icon"} onTouchEnd={onDelete} onMouseDown={onDelete}/>}
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
        async={true} cache={{}} loadOptions={(query, cb) => {
        Promise.resolve().then(() => props.field.getOptions('')).then(res => {
          cb(null, { options: res })
        }, err => {
          console.log(err);
        });
      }}
        multi={false}
        placeholder={props.placeholder || ''}
        optionComponent={Option}
        noResultsText={<Typography>{'No results found'}</Typography>}
        arrowRenderer={arrowProps => { return arrowProps.isOpen ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>; }}
        clearRenderer={() => <ClearIcon/>}
        //valueComponent={valueProps => renderValue(valueProps)}
        {...other}
        value={props.field.value}
        onChange={e => {
          this.props.field.touch();
          this.props.field.value = e;
          this.updateDirty();
        }}

      />
    );
  }

}

@observer
export class InnerSelector extends React.Component<{ field: SelectField, classes, placeholder? }, any> {
  static contextTypes = { muiFormControl: PropTypes.object };
  static childContextTypes = { muiFormControl: PropTypes.object };
  muiFormControl: any;
  field: SelectField;

  constructor(props: { field: SelectField; classes }, context: any) {
    super(props, context);
    this.muiFormControl = context.muiFormControl;
    this.field = props.field;
  }

  componentDidMount(): void {
    this.updateDirty();
  }

  updateDirty() {
    if (this.muiFormControl) {
      if (this.field.getValue()) {
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
      onChange={(v: any) => {      }}
      value={this.field.getValue()?"any string":""}
      inputComponent={SelectWrapped}
      inputProps={{
        simpleValue: false,
        classes: this.props.classes,
        field: this.props.field,
        placeholder: this.props.placeholder || '',
        muiFormControl :this.muiFormControl
      }}
    />
  }
}

export const Select:any = withStyles(styles as any)(InnerSelector) as any;
