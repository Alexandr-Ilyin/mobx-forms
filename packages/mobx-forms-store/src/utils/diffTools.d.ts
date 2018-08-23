export declare function getJsonDiff(source: any, target: any): any;
export declare function applyJsonDiff(source: any, diff: any): any;
export declare function getStrDiff(source: any, target: any): any[];
export declare enum DiffType {
    noChanges = 0,
    hasSmallChanges = 1,
    removedBigText = 2,
    addedBigText = 4
}
export declare function applyStrDiff(source: any, patch: any): string;
export declare function checkDiff(diff: any): DiffType;
