import { DialogContext, IDialog, DialogService } from '../src/modals/dialogService';
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';
import * as assert from 'assert';
import equal = assert.equal;

describe("Dialogs", function() {
  it("should show and return results.", async function() {
    class Simple implements IDialog<string> {
      render(ctx: DialogContext<string>) {
        return <Dialog open={true}>
          <DialogContent>
            <h1>Content</h1>
            Content Content Content Content Content
            Content Content Content Content Content
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
          </DialogActions>
        </Dialog>
      }
    }

    let p1 = await DialogService.show(new Simple());
    equal(p1,"a");
  });


  it("should show nested.", async function() {
    class Simple implements IDialog<string> {
      render(ctx: DialogContext<string>) {
        return <Dialog open={true}>
          <DialogContent>
            <h1>Content</h1>
            Content Content Content Content Content
            Content Content Content Content Content
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
          </DialogActions>
        </Dialog>
      }
    }
    class Simple2 implements IDialog<string> {
      render(ctx: DialogContext<string>) {
        return <Dialog open={true}>
          <DialogContent>
            <h1>Content</h1>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
            <Button onClick={()=>ctx.complete("a")}>Close</Button>
          </DialogActions>
        </Dialog>
      }
    }
    let p1 = DialogService.show(new Simple());
    let p2 = DialogService.show(new Simple2());
    await p1;
    await p2;

  })
});