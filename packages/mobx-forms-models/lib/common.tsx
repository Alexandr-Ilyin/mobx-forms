import { computed, observable,autorun } from 'mobx';
import { action, decorate } from 'mobx';


export interface IFieldContainer {
  add(field: IFormField)
  remove(field: IFormField)
}

export interface IFormField {
  isValid(): boolean
  touch();
}


export class TestA {
  @observable B = "2";
}
// decorate(TestA, {
//   B: observable,
// });

let a = new TestA();
a.B = "4f";
autorun(() => console.log("X-" + a.B));
debugger
a.B = "2344544";
a.B = "2344541114";
a.B = "234454111423";

export  const AAA = a;


export class FormField<T> implements IFormField {
  @observable validators = [];
  @observable value: T;
  @observable name: string;
  @observable touched;
  @observable loading;
  @observable B;


  constructor(parent: IFieldContainer, name: string) {
    this.name = name;
    if (parent)
      parent.add(this);
  }

  touch() {
    this.touched = true;
  }

  isValid(): boolean {
    return this.error == null;
  }

  @computed get error(): string {
    for (let i = 0; i < this.validators.length; i++) {
      const err = this.validators[i]();
      if (err) {
        return err;
      }
    }
    return null;
  }

  validate(v): FormField<T> {
    this.validators.push(v);
    return this;
  }

  required(): FormField<T> {
    this.validators.push(() => {
      if ((this.value as any) === '' || this.value == null) {
        return this.name + " is required";
      }
    });
    return this;
  }

  @computed get visibleError(): string {
    if (this.touched) {
      return this.error;
    }
    return null;
  }

  defaultValue(v: T): FormField<T> {
    this.value = v;
    return this;
  }
}
