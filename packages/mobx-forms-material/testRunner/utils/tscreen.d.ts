export declare class TScreen {
    $el: any;
    private selector;
    private parent;
    constructor(selector: any, parent?: any);
    checkbox(s: any, val: any): Promise<any>;
    get$my(): Promise<any>;
    keyUp(s: string, key: any): Promise<any>;
    keyDown(s: string, key: any): Promise<any>;
    focus(s: string): Promise<any>;
    checkHidden(e: string): Promise<any>;
    click(s: string): Promise<any>;
    getEl(e: string, checker?: any): Promise<any>;
    checkVisible(s: string): Promise<any>;
    type(s: string, text: string): Promise<any>;
}
