import { observable } from 'mobx';

export class SelectValue {
  constructor(label?: string, value?: string) {
    this.label = label;
    this.value = value;
  }
  @observable label: string;
  @observable value: string;
}