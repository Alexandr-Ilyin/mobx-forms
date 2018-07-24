/// <reference types="react" />
import { IComponent } from '../common/ui-attr';
import { AsyncLoader } from '../loader/asyncLoader';
import { Queue } from '../common/queue';
export declare class Column<T> {
    title: any;
    format: (v: T) => any;
    private options;
    constructor(title: any, format: (v: T) => any, options?: {
        isNumeric?: boolean;
    });
}
export declare abstract class ListAction<T> {
    abstract renderCell(v: T): any;
}
export declare class EditAction<T> extends ListAction<T> {
    private readonly editFunc;
    constructor(editFunc: (v: T) => any);
    renderCell(v: T): JSX.Element;
}
export declare class ListActions {
    static Edit<T>(editFunc: any): EditAction<{}>;
}
export interface DataBatch<T> {
    items: T[];
    totalCount?: number;
}
export interface ListSourceCfg<T> {
    getData(skip: any, take: any): Promise<DataBatch<T>>;
}
export declare class List<T> {
    loader: AsyncLoader;
    columns: Column<T>[];
    actions: ListAction<T>[];
    filters: IComponent[];
    data: any[];
    page: number;
    rowsPerPage: number;
    count: number;
    queue: Queue;
    private source;
    constructor();
    setSource(source: ListSourceCfg<T>): Promise<void>;
    updateData(): Promise<void>;
    addFilter(f: IComponent): void;
    onFilterChanged(): void;
    addRowAction(a: ListAction<T>): void;
    addColumn(title: any, format: (t: T) => any): void;
    render(): JSX.Element;
    private handleChangePage;
    private handleChangeRowsPerPage;
}
