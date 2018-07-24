export declare class Progress {
    private _children;
    private _completeCount;
    private _totalCount;
    private _events;
    private _name;
    private _id;
    constructor(name?: string);
    totalCount(count: number): Progress;
    waitTotalBytes(getCount: Promise<number>): Progress;
    completeCount(length: number): void;
    child(name?: any): Progress;
    complete(completeChildren?: boolean): Progress;
    private log;
    mon<T>(p: Promise<T>): Promise<T>;
    private _runRecursive;
    fullProgress(): number;
    fullStat(): {
        completeUnits: any;
        fullUnits: any;
    };
    withChild(child: Progress): Progress;
    addChild(child: Progress): Progress;
    triggerOnChange(): void;
    onChange(handler: () => any): void;
    unChange(handler: () => any): void;
    getLog(): string;
}
