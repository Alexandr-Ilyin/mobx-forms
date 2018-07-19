import Edit from '@material-ui/icons/Edit';
import { cmp } from '../common/ui-attr';
import { observable } from 'mobx';
import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';

@cmp
export class Column<T> {
  title;
  format: (v: T) => any;
  private options: { isNumeric?: boolean };

  constructor(title, format:(v:T)=>any, options?:{isNumeric?:boolean}) {
    if (!options)
      options = {};
    this.title = title;
    this.format = format;
    this.options = options;
  }
}

export abstract class ListAction<T>{
  abstract renderCell(v:T);
}

export class EditAction extends ListAction<T>{
  private editFunc:(v:T)=>any;

  constructor(editFunc:(v:T)=>any) {
    super();
    this.editFunc = editFunc;
  }

  renderCell(v:T){
    return <a href="javascript:;" onClick={()=>this.editFunc(v)}>
      <Edit/>
    </a>;
  }
}


export class ListActions{
  static Edit<T>(editFunc) {return new EditAction(editFunc) };
}




@cmp
export class List<T> {

  @observable columns:Column<T>[] = [];
  @observable actions:ListAction<T>[] = [];
  @observable data:any[] = [];
  @observable page=0;
  @observable rowsPerPage=50;

  setData(data:T[]){
    this.data = data;
  }
  addRowAction(a: ListAction) {
      this.actions.push(a);
  }

  addColumn(title, format:(t:T)=>any){
      this.columns.push(new Column<T>(title, format));
  }

  render(){
    return <Table >
      <TableHead>
        <TableRow>
          {this.columns.map(c=><TableCell>{c.title}</TableCell>)}
          <TableCell/>
        </TableRow>
      </TableHead>
      <TableBody>
        {this.data.map(n => {
          return (
            <TableRow key={n.id}>
              {this.columns.map(c=><TableCell>{c.format(n)}</TableCell>)}
              <TableCell padding="none">
                {this.actions.map((x)=>x.renderCell(n))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            colSpan={3}
            count={this.data.length}
            rowsPerPage={this.rowsPerPage}
            page={this.page}
            onChangePage={(e)=>this.handleChangePage(e)}
            onChangeRowsPerPage={(e)=>this.handleChangeRowsPerPage(e)}
          />
        </TableRow>
      </TableFooter>
    </Table>
  }

  private handleChangePage(e) {
  }

  private handleChangeRowsPerPage(e) {

  }
}