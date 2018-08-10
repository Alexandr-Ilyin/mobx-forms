/// <reference types="react" />
import { BadgePanel } from '../badgePanel/badgePanel';
export declare class AsyncLoader {
    badgePanel: BadgePanel;
    wait<T>(promise: (() => Promise<T>) | Promise<T>, notificationMsg?: any): Promise<T>;
    waitPromise<T>(promise: Promise<T>, notificationMsg?: any): Promise<T>;
    showError(err: any): void;
    render(children: any): JSX.Element;
}
