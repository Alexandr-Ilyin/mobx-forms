/// <reference types="react" />
import { Queue } from '../common/queue';
export declare class AsyncLoader {
    loaded: boolean;
    loading: boolean;
    starting: boolean;
    error: any;
    getter: () => any;
    queue: Queue;
    constructor(loading?: boolean);
    refresh(): Promise<any>;
    wait<T>(promise: ((() => Promise<T>) | Promise<T>)): Promise<T>;
    load(getter: () => any): Promise<any>;
    render(children: any): JSX.Element;
}
