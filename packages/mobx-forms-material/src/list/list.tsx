import Edit from '@material-ui/icons/Edit';
import { cmp, IComponent } from '../common/ui-attr';
import { autorun, observable } from 'mobx';
import * as React from 'react';
import * as _ from 'lodash';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import { AsyncLoader } from '../loader/asyncLoader';
import { StrField } from '../strField';
import { Grid } from '@material-ui/core';
import { Queue } from '../common/queue';
import { wait } from '../store/internals/entityStore';

@cmp
export class Column<T> {
  title;
  format: (v: T) => any;
  private options: { isNumeric?: boolean };

  constructor(title, format: (v: T) => any, options?: { isNumeric?: boolean }) {
    if (!options) {
      options = {};
    }
    this.title = title;
    this.format = format;
    this.options = options;
  }
}

export abstract class ListAction<T> {
  abstract renderCell(v: T);
}

export class EditAction<T> extends ListAction<T> {
  private readonly editFunc: (v: T) => any;

  constructor(editFunc: (v: T) => any) {
    super();
    this.editFunc = editFunc;
  }

  renderCell(v: T) {
    return <a href="javascript:" onClick={() => this.editFunc(v)}>
      <Edit/>
    </a>;
  }
}

export class ListActions {
  static Edit<T>(editFunc) {return new EditAction(editFunc) };
}

export interface DataBatch<T> {
  items: T[],
  totalCount?: number
}

export interface ListSourceCfg<T> {
  getData:(skip, take)=> Promise<DataBatch<T>>;
}

@cmp
export class List<T> {

  @observable loader = new AsyncLoader();
  @observable columns: Column<T>[] = [];
  @observable actions: ListAction<T>[] = [];
  @observable filters: IComponent[] = [];
  @observable data: any[] = [];
  @observable page = 0;
  @observable rowsPerPage = 25;
  @observable count = 0;
  @observable v = 0;
  @observable _onRowClick;
  private source: ListSourceCfg<T>;

  constructor() {
    this.onFilterChanged = _.debounce(this.onFilterChanged.bind(this), 1000);
  }

  async setSource(source: ListSourceCfg<T>) {
    this.source = source;
    await this.updateData();

  }

  async updateData() {
    this.v++;
    let v = this.v;
    return this.loader.wait(async () => {
      let data = await this.source.getData(this.page * this.rowsPerPage, this.rowsPerPage);
      if (v != this.v)
        return;
      this.data = data.items;
      this.count = data.totalCount;
    });
  }

  addFilter(f: IComponent) {
    this.filters.push(f);
    if (f['getValue']) {
      let firstTime = true;
      autorun(() => {

        f['getValue']();
        setTimeout(() => {
          if (!firstTime) {
            return this.onFilterChanged();
          }
          firstTime = false;
        });
      });
    }
  }

  onFilterChanged() {

    if (this.source != null) {
      this.updateData();
    }
  }

  addRowAction(a: ListAction<T>) {
    this.actions.push(a);
  }

  onRowClick(a:(t: T) => any) {
    this._onRowClick = a;
  }
  addColumn(title, format: (t: T) => any) {
    this.columns.push(new Column<T>(title, format));
  }

  render() {
    return <div>
      {this.filters.length > 0 &&
      <Grid justify={'flex-end'} alignItems={'flex-end'} container={true} alignContent={'flex-end'}>
        {this.filters.map(f => {
          return <Grid item={true} xs={4} alignItems={'flex-end'} alignContent={'flex-end'}>
            {f.render()}
          </Grid>
        })}
      </Grid>}
      <div>
        {this.loader.render(
          <Table>
            <TableHead>
              <TableRow>
                {this.columns.map(c => <TableCell>{c.title}</TableCell>)}
                <TableCell/>
              </TableRow>
            </TableHead>
            {this.data.map(n => {
              return (
                <TableBody>
                  <TableRow key={n.id}
                            className={"list-row list-row-selectable-"+(this._onRowClick!=null)}
                            onClick={this._onRowClick==null ? null : ()=>this._onRowClick(n)}>
                    {this.columns.map(c => <TableCell>{c.format(n)}</TableCell>)}
                    <TableCell padding="none">
                      {this.actions.map((x) => x.renderCell(n))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              );
            })}

            {this.count > this.data.length && <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={3}
                  count={this.count}
                  rowsPerPage={this.rowsPerPage}
                  page={this.page}
                  onChangePage={(e, a) => this.handleChangePage(a)}
                  onChangeRowsPerPage={(e) => this.handleChangeRowsPerPage(e.target.value)}
                />
              </TableRow>
            </TableFooter>}
          </Table>)}
      </div>
    </div>;
  }

  //
  private handleChangePage(pageNum) {
    this.page = pageNum;
    this.updateData();
  }

  private handleChangeRowsPerPage(rowsPerPage) {
    this.rowsPerPage = rowsPerPage;
    this.updateData();
  }
}