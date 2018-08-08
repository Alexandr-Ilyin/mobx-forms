import { observable } from 'mobx';
import * as _ from "lodash";
import { SelectValue } from '../forms/selections';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';
import { MultiSelect } from './multiSelect';
import * as React from 'react';
import { FormControl, FormLabel, InputLabel } from '@material-ui/core';
import { SelectField } from '../select/selectField';
import { cmp } from '../common/ui-attr';

export interface MultiSelectFieldCfg<TKey, T> extends FormFieldCfg<T[]> {
  getOptions: (query?: string) => Promise<T[]>;
  getOptionByKey?: (key: TKey) => Promise<T>;
  getKey: (t: T) => TKey;
  getLabel: (t: T) => string;

}

export class MultiSelectField<TKey, T> extends FormField<T[]> {
  getOptionByKey?: (key: TKey) => Promise<T>;
  getOptions: (query?: string) => Promise<T[]>;
  getKey: (t: T) => TKey;
  getLabel: (t: T) => string;

  constructor(parent: IFieldContainer, cfg: MultiSelectFieldCfg<TKey, T>) {
    super(parent, cfg);
    this.getOptions = cfg.getOptions;
    this.getOptionByKey = cfg.getOptionByKey;
    this.value = cfg.defaultValue as any || [];
    this.getKey = cfg.getKey;
    this.getLabel = cfg.getLabel;  }

  getValueKeys(): TKey[] {
    return this.value.map(x=>this.getKey(x));
  }
  async setValueKeys(keys: TKey[]): Promise<any> {
    if (!keys) {
      keys = [];
    }

    if (keys.length == 0) {
      this.value = [];
      return;
    }
    if (this.getOptionByKey) {
      let v = [];
      let list = keys.map(x => this.getOptionByKey(x).then(z => v.push(z)));
      await Promise.all(list);
      this.value = v;
    }
    else {
      let options = await this.getOptions();
      let v = [];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let o = options.find(x => this.getKey(x)== key);
        if (o) {
          v.push(_.cloneDeep(o));
        }
      }
      this.value = v;
    }
  }

  isEmpty() {
    return !this.value || this.value.length==0;
  }
  render() {
    return <FormControl fullWidth={true} error={this.visibleError} className={"field-hasError-"+(this.visibleError && true)}    >
      <InputLabel>{this.displayName}</InputLabel>
      <MultiSelect field={this} classes={{}}/>
    </FormControl>;
  }
}

export interface MultiSelectFieldSimpleCfg<TKey> extends FormFieldCfg<SelectValue<TKey>[]> {
  getOptions: (query?: string) => Promise<SelectValue<TKey>[]>;
  getOptionByKey?: (key: TKey) => Promise<SelectValue<TKey>>;
}

export class MultiSelectFieldSimple<TKey> extends MultiSelectField<TKey, SelectValue<TKey>> {
  constructor(parent: IFieldContainer, cfg: MultiSelectFieldSimpleCfg<TKey>) {
    super(parent, {
      ...cfg,
      getKey: (t: SelectValue<TKey>) => t.value,
      getLabel: (t: SelectValue<TKey>) => t.label,
    });
  }
}

@cmp
export class MultiSelectFieldStr extends MultiSelectFieldSimple<string> {
}