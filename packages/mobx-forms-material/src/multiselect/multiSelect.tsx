import * as  React  from 'react';
import {MultiSelectField} from 'mobx-forms-models/lib/fields';
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
import Select from 'react-select';
import MenuItem from '@material-ui/core/MenuItem';

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
        }}
      >
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
            deleteIcon={<CancelIcon onTouchEnd={onDelete} />}
            onDelete={onDelete}
          />
        );
      }
      return <div className="Select-value">{children}</div>;
    }
  }
  debugger;
  return (

    <Async

        //isLoading={this.props.field.loader.loading || undefined}
        async={true} cache={{}} loadOptions={(query,cb)=>{
        Promise.resolve().then(()=>props.field.getOptions('')).then(res=>{
          cb(null, {options:res})
        });
      }}
        onChange={e=>{
          this.props.field.touch();
          this.props.field.value=e;
        }}
        value={props.field.value}
        optionComponent={Option}
        noResultsText={<Typography>{'No results found'}</Typography>}
        arrowRenderer={arrowProps => {        return arrowProps.isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;      }}
        clearRenderer={() => <ClearIcon />}
        valueComponent={valueProps => renderValue(valueProps)}
        {...other}
      />
  );
  return (
    <Select
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
  render() {
    return <Input
      fullWidth
      onChange={(v:any)=>{
        this.props.field.setValue(v);
      }}
      placeholder="Search a country (start with a)"
      id="react-select-single"
      inputComponent={SelectWrapped}
      inputProps={{
        name: 'react-select-single',
        instanceId: 'react-select-single',
        simpleValue: true,
        classes: this.props.classes,
        field:this.props.field,
      }}
    />
  }
}

export const MultiSelect  = withStyles(styles)(InnerSelector);
