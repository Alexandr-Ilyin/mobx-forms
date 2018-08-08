/// <reference types="react" />
export interface Badge {
    render(): any;
}
declare class BadgeState {
    visible: boolean;
    b: Badge;
    num: number;
    constructor(b: Badge, n: number);
}
export declare class LoaderBadge {
    render(): JSX.Element;
}
export declare class MessageBadge {
    private msg;
    constructor(msg: any);
    render(): JSX.Element;
}
export declare class BadgePanel {
    badges: BadgeState[];
    badgeNum: number;
    addMessage<T>(message: any, p: Promise<T>): Promise<T>;
    addLoading<T>(p: Promise<T>): Promise<T>;
    addBadge<T>(b: Badge, p: Promise<T>): Promise<T>;
    render(props: any): JSX.Element;
}
export {};
