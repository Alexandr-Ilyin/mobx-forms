import { observable } from 'mobx';
import * as _ from "lodash";
import { FormField, IFieldContainer } from '../../../mobx-forms-models/lib/common';

export class SelectValue {
  constructor(label?: string, value?: string) {
    this.label = label;
    this.value = value;
  }
  @observable label: string;
  @observable value: string;
}