/// <reference types="react" />
import { Queue } from '../common/queue';
import { AppEvent } from '../common/events';
export declare class AsyncLoader {
    loading: boolean;
    queue: Queue;
    mustShowNotification: AppEvent<string>;
    constructor();
    wait<T>(promise: ((() => Promise<T>) | Promise<T>), notificationMsg?: any): Promise<T>;
    showError(err: any): void;
    load(getter: () => any): Promise<any>;
    render(children: any): JSX.Element;
}
