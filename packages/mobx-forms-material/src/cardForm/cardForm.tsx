import { FormBase, FormField, IFieldContainer, IFormField } from '../forms/basic';
import { AsyncLoader } from '../loader/asyncLoader';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { CardHeader } from '@material-ui/core';
import * as React from 'react';

export abstract class CardForm extends FormBase implements IFormField, IFieldContainer {
  loader = new AsyncLoader();

  constructor(parent: IFieldContainer) {
    super(parent);
    this.loader.wait(() => this.init());
  }

  protected async init(): Promise<any> {
  }

  renderHeader():any{
    return null;
  }

  abstract renderBody();

  renderActions():any{
    return null;
  }

  render() {
    let header = this.renderHeader() || null;
    let actions = this.renderActions() || null;
    return <Card className={"card-form"}>
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent>{this.loader.render(this.renderBody())}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>;
  }
}

