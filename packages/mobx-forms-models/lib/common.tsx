import { computed, observable, autorun } from 'mobx';
import { removeArrayItem } from '../../mobx-forms-material/src/common/utils';

export interface IFieldContainer {
  addField(field: IFormField)
  removeField(field: IFormField)
}

export interface IFormField {
  displayName?: string
  isValid(): boolean
  touch();
}

export interface IValidator<T> {
  (v: T, owner: FormField<T>): string
}

export interface FormFieldCfg<T> {
  defaultValue?: T,
  validations?: IValidator<T>[]
  displayName?: string
}

export class Form implements IFormField, IFieldContainer {
  @observable fields: IFormField[] = [];

  removeField(field: IFormField) {
    removeArrayItem(field, this.fields);
  }
  addField(field: IFormField) {
    this.fields.push(field);
  }

  constructor(parent?: IFieldContainer) {
    if (parent) {
      parent.addField(this);
    }
  }

  isValid(): boolean {
    return this.fields.find(x => !x.isValid()) == null;
  }

  touch() {
    this.fields.forEach(x => x.touch());
  }

  validate(): boolean {
    this.touch();
    return this.isValid();
  }

}

export class FormField<T> implements IFormField {
  @observable validators: IValidator<T>[] = [];
  @observable value: T;
  @observable displayName: string;
  @observable touched;
  @observable loading;
  @observable B;

  constructor(parent: IFieldContainer, cfg: FormFieldCfg<T>) {
    this.displayName = name;
    if (parent) {
      parent.addField(this as IFormField);
    }
    this.validators = cfg.validations || [];
    this.displayName = cfg.displayName || "";
    this.value = cfg.defaultValue || null;
  }

  getValue(): T {
    return this.value;
  }

  async setValue(vals: T): Promise<any> {
    this.value = vals;
  }

  touch() {
    this.touched = true;
  }

  isValid(): boolean {
    return this.error == null;
  }

  @computed get error(): string {
    for (let i = 0; i < this.validators.length; i++) {
      const err = this.validators[i](this.value,this);
      if (err) {
        return err;
      }
    }
    return null;
  }

  @computed get visibleError(): string {
    if (this.touched) {
      return this.error;
    }
    return null;
  }
}
console.log("asd111");
//a=