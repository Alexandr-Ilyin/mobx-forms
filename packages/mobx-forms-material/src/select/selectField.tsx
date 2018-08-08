import { observable } from 'mobx';
import * as _ from "lodash";
import * as React from "react";
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import { SelectValue } from '../forms/selections';
import { Select } from './select';
import { cmp } from '../common/ui-attr';
import { InputLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl/FormControl';
import { SelectFieldCfg } from './selectField';

export interface SelectFieldCfg<TKey, T> extends FormFieldCfg<T> {
  getOptions?: (query?: string) => Promise<T[]>;
  getOptionByKey?: (key: TKey) => Promise<T>;
  getKey?: (t: T) => TKey;
  getLabel?: (t: T) => string;

}

@cmp
export class SelectField<TKey, T> extends FormField<T> {
  getOptions: (query?: string) => Promise<T[]>;
  getKey: (t: T) => TKey;
  getLabel: (t: T) => string;
  getOptionByKey?: (key: TKey) => Promise<T>;

  constructor(parent: IFieldContainer, cfg: SelectFieldCfg<TKey, T>) {
    super(parent, cfg);
    this.getOptions = cfg.getOptions;
    this.getOptionByKey = cfg.getOptionByKey;
    this.getKey = cfg.getKey;
    this.getLabel = cfg.getLabel;
  }

  getValueKey(): TKey {
    if (this.value) {
      return this.getKey(this.value);
    }
    return null;
  }

  async setValueKey(key: TKey): Promise<any> {
    if (!key) {
      this.value = null;
      return;
    }
    if (this.getOptionByKey) {
      this.value = await this.getOptionByKey(key);
    }
    else {
      let options = await this.getOptions();
      let o = options.find(x => this.getKey(x) == key);
      if (o) {
        this.value = _.cloneDeep(o);
        return;
      }
      this.value = null;
      return;
    }
  }

  render() {
    return <FormControl fullWidth={true} error={this.visibleError!=null} className={"field-hasError-"+(this.visibleError && true)}>
      <InputLabel shrink={this.getValueKey()!=null}>{this.displayName}</InputLabel>
      <Select field={this} classes={{}}/>
    </FormControl>;
  }
}

export interface SelectFieldSimpleCfg<TKey> extends FormFieldCfg<SelectValue<TKey>> {
  getOptions: (query?: string) => Promise<SelectValue<TKey>[]>;
  getOptionByKey?: (key: TKey) => Promise<SelectValue<TKey>>;
}

export class SelectFieldSimple<TKey> extends SelectField<TKey, SelectValue<TKey>> {
  constructor(parent: IFieldContainer, cfg: SelectFieldSimpleCfg<TKey>) {
    super(parent, {
      ...cfg,
      getKey: (t: SelectValue<TKey>) => t.value,
      getLabel: (t: SelectValue<TKey>) => t.label,
    });
  }
}

@cmp
export class SelectFieldStr extends SelectFieldSimple<string> {
}