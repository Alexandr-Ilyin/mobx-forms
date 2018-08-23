import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogContext, IDialog } from '../modals/dialogService';
import { observer } from 'mobx-react';
import { cmp } from '../common/ui-attr';
import { OfflineErrorIcon } from './offlineIcon';
import { isOfflineError } from '../common/offlines';

export function getErrorUi(error) {
  if (!error) {
    return null;
  }

  if (isOfflineError(error)) {
    return <OfflineErrorIcon/>;
  }

  if (typeof (error) === "string") {
    return error;
  }
  if (error && error.htmlMessage) {
    return error.htmlMessage;
  }

  if (error && error.message) {
    return error.message;
  }
  return null;
}

@cmp
export class ErrorModal implements IDialog<any> {
  private err;

  constructor(err) {
    this.err = err;
  }

  render(ctx: DialogContext<any>) {
    return <Dialog open={true} >
      <DialogTitle>Error</DialogTitle>
      <DialogContent style={{minWidth:"340px"}}>
        <DialogContentText>
          {getErrorUi(this.err)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>ctx.complete(null)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>;
  }
}