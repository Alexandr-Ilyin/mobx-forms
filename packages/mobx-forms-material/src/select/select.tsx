import * as  React from 'react';
import * as PropTypes from 'prop-types'
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
export class SelectWrapped<TKey, TObj> extends React.Component<{ field: SelectField<TKey, TObj>, classes, placeholder }, any> {
  static contextTypes = { muiFormControl: PropTypes.object };
  static childContextTypes = { muiFormControl: PropTypes.object };
  muiFormControl: any;

  constructor(props: { field: SelectField<TKey, TObj>; classes; placeholder, muiFormControl }, context: any) {
    super(props, context);
    this.muiFormControl = props.muiFormControl || context.muiFormControl;
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
    let newVar = arrowProps => { return arrowProps.isOpen ? (<ArrowDropUpIcon/>) : (<ArrowDropDownIcon/>); };
    let nv2 = () => <ClearIcon/>;
    let v = props.field.value ?
      {
        label: props.field.getLabel(props.field.value),
        value: props.field.getKey(props.field.value),
        obj: props.field.value
      } : null;

    return (
      <Async
        //isLoading={this.props.field.loader.loading || undefined}
        async={true} cache={{}} loadOptions={(query, cb) => {
        Promise.resolve().then(() => props.field.getOptions(query)).then(res => {
          cb(null, {
            options: res.map(o => ({
              label: props.field.getLabel(o),
              value: props.field.getKey(o),
              obj: o
            }))
          })
        }, err => {
          console.log(err);
        });
      }}
        multi={false}
        loadingPlaceholder={''}
        placeholder={props.placeholder || ''}
        optionComponent={Option}
        noResultsText={<Typography>{'No results found'}</Typography>}
        arrowRenderer={newVar}
        clearRenderer={nv2}
        {...other}
        value={v}
        onChange={e => {
          this.props.field.touch();

          this.props.field.value = e ? e.obj : null;
          this.updateDirty();
        }}

      />
    );
  }
}

@observer
export class InnerSelector<TKey, T> extends React.Component<{ field: SelectField<TKey, T>, classes, placeholder? }, any> {
  static contextTypes = { muiFormControl: PropTypes.object };
  static childContextTypes = { muiFormControl: PropTypes.object };
  muiFormControl: any;
  field: SelectField<TKey, T>;

  constructor(props: { field: SelectField<TKey, T>; classes }, context: any) {
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

  componentWillReceiveProps(nextProps: Readonly<{ field: SelectField<TKey, T>; classes; placeholder? }>, nextContext: any): void {
    //this.updateDirty();
  }

  render() {
    let ip = {
      simpleValue: false,
      classes: this.props.classes,
      field: this.props.field,
      placeholder: this.props.placeholder || '',
      muiFormControl: this.muiFormControl
    };
    let v = this.field.getValue() ? "any string" : "";
    return <Input      fullWidth      onChange={(v: any) => { }}      value={v}      inputComponent={SelectWrapped}      inputProps={ip}    />
    }
  }

  export const Select: any = withStyles(styles as any)(InnerSelector) as any;
