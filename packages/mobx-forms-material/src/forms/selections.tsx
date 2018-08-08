import { observable } from 'mobx';

export class SelectValue<TKey> {
  constructor(label?: string, value?: TKey) {
    this.label = label;
    this.value = value;
  }
  label: string;
  value: TKey;
}