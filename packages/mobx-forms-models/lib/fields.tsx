import { observable } from 'mobx';
import * as _ from "lodash";
import { FormField, IFieldContainer } from './common';

export class SelectValue {

  constructor(label?: string, value?: string) {
    this.label = label;
    this.value = value;
  }

  @observable label: string;
  @observable value: string;
}
export class NumField extends FormField<number> {

}
export class StrField extends FormField<string> {
}
export class DateField<T> extends FormField<Date> {
}

export class SelectFieldBase<T extends SelectValue> extends FormField<T> {
  getOptions: (query?: string) => Promise<T[]>;

  textRequired(): SelectFieldBase<T> {
    this.validators.push(() => {
      if (this.getLabel() == '' || this.getLabel() == null) {
        return this.name + " is required";
      }
    });
    return this;
  }

  async selectByText(s: string) {
    let options = await this.getOptions(s);
    let value = options.find(x=>x.label==s).value;
    await this.setValue(value);
  }

  options(getOptions: (query?: string) => Promise<T[]>) {
    this.getOptions = getOptions;
    return this;
  }

  required(): SelectFieldBase<T> {
    return super.required() as SelectFieldBase<T>;
  }

  getVal(): string {
    return this.value ? this.value.value : null;
  }

  getLabel(): string {
    return this.value ? this.value.label : null;
  }

  constructor(parent: IFieldContainer, name: string) {
    super(parent, name);
  }

  async setValue(val: string): Promise<any> {
    if (!val) {
      return;
    }
    let options = await this.getOptions();
    let o = options.find(x => x.value == val);
    if (o) {
      this.value = _.cloneDeep(o);
    }
  }
}

export class MultiSelectFieldBase<T extends SelectValue> extends FormField<T[]> {
  getOptions: (query?: string) => Promise<T[]>;
  getOptionByKey: (key: string) => Promise<T>;

  constructor(parent: IFieldContainer, name: string) {
    super(parent, name);
  }

  async selectByText(s: string) {
    let options = await this.getOptions(s);
    let value = options.find(x=>x.label==s).value;
    await this.setValue(value);
  }

  options(getOptions: (query?: string) => Promise<T[]>) {
    this.getOptions = getOptions;
    return this;
  }

  optionByKey(getOption: (key: string) => Promise<T>) {
    this.getOptionByKey = getOption;
    return this;
  }

  required(): MultiSelectField<T> {
    this.validators.push(() => {
      if ((this.value as any) == null || this.value.length == 0) {
        return this.name + " is required";
      }
    });
    return this;
  }

  getValue(): string[] {
    return this.value;
  }


  async setValue(vals: T[]): Promise<any> {
    this.value = vals || [];
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
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
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

export class SelectField extends SelectFieldBase<SelectValue> {


}
