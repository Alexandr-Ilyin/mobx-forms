export declare class Queue {
    promise: Promise<any>;
    length: number;
    enqueue(p: () => any): Promise<any>;
    makeQueued(func: any): () => Promise<any>;
    isEmpty(): boolean;
}
