import { computed, observable} from 'mobx';
import { removeArrayItem } from '../common/utils';
import { AsyncLoader } from '../loader/asyncLoader';
import { Validation } from './validators';

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

export class FormBase implements IFormField, IFieldContainer {
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


export class ArrayField<T extends IFormField>  implements IFormField {
  @observable items:T[] = [];

  constructor(parent: FormBase) {
    parent.fields.push(this);
  }

  add(field: IFormField) {
    this.items.push(field as T);
  }

  isValid(): boolean {
    return this.items.find(x => !x.isValid()) == null;
  }

  touch() {
    this.items.forEach(x => x.touch());
  }
}

export interface FormFieldCfg<T> {
  required?: boolean,
  defaultValue?: T,
  validations?: IValidator<T>[]
  displayName?: string
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
    if (cfg.required)
      this.validators.push(Validation.required<T>());
    this.displayName = cfg.displayName || "";
    this.value = cfg.defaultValue;

  }

  getValue(): T {
    return this.value;
  }

  setValue(vals: T) {
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
