import { observable } from 'mobx';
import * as _ from "lodash";
import { FormField, FormFieldCfg, IFieldContainer } from './common';
import { SelectValue } from '../../../../src/forms/selections';

export interface SelectFieldCfg<T extends SelectValue> extends FormFieldCfg<T> {
  getOptions: (query?: string) => Promise<T[]>;
  getOptionByKey?: (key: string) => Promise<T>;
}

export class SelectFieldBase<T extends SelectValue> extends FormField<T> {
  getOptionByKey?: (key: string) => Promise<T>;
  getOptions: (query?: string) => Promise<T[]>;

  constructor(parent: IFieldContainer, cfg: SelectFieldCfg<T>) {
    super(parent, cfg);
    this.getOptions = cfg.getOptions;
    this.getOptionByKey = cfg.getOptionByKey;
  }

  optionByKey(getOption: (key: string) => Promise<T>) {
    this.getOptionByKey = getOption;
    return this;
  }

  async setValueKey(key: string): Promise<any> {
    if (!key) {
      this.value = null;
      return;
    }
    if (this.getOptionByKey) {
      this.value = await this.getOptionByKey(key);
    }
    else {
      let options = await this.getOptions();
      let o = options.find(x => x.value == key);
      if (o) {
        this.value = _.cloneDeep(o);
        return;
      }
      this.value = null;
      return;
    }
  }
}

export class SelectField extends SelectFieldBase<SelectValue> {

}