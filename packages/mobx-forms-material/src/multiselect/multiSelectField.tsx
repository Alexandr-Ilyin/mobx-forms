import { observable } from 'mobx';
import * as _ from "lodash";
import { SelectValue } from '../forms/selections';
import { FormField, FormFieldCfg, IFieldContainer } from '../forms/basic';

export interface MultiSelectFieldCfg<T extends SelectValue> extends FormFieldCfg<T[]> {
  getOptions: (query?: string) => Promise<T[]>;
  getOptionByKey?: (key: string) => Promise<T>;
}


export class MultiSelectFieldBase<T extends SelectValue> extends FormField<T[]> {
  getOptionByKey?: (key: string) => Promise<T>;
  getOptions: (query?: string) => Promise<T[]>;

  constructor(parent: IFieldContainer, cfg: MultiSelectFieldCfg<T>) {
    super(parent, cfg);
    this.getOptions = cfg.getOptions;
    this.getOptionByKey = cfg.getOptionByKey;
  }

  optionByKey(getOption: (key: string) => Promise<T>) {
    this.getOptionByKey = getOption;
    return this;
  }

  async setValueKeys(keys: string[]): Promise<any> {
    if (!keys)
      keys = [];

    if (keys.length==0) {
      this.value = [];
      return;
    }
    if (this.getOptionByKey){
      let v = [];
      let list = keys.map(x=>this.getOptionByKey(x).then(z=>v.push(z)));
      await Promise.all(list);
      this.value = v;
    }
    else {
      let options = await this.getOptions();
      let v = [];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let o = options.find(x => x.value == key);
        if (o) {
          v.push(_.cloneDeep(o));
        }
      }
      this.value = v;
    }
  }
}
export class MultiSelectField extends MultiSelectFieldBase<SelectValue>{
}
