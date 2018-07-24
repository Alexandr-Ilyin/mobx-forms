export declare class MatchRule {
    re: RegExp;
    names: any[];
    private path;
    constructor(path: string);
    getMatchParams(segment: any): any;
}
