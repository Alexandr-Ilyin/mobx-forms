export declare class TestScreen {
    private screen;
    constructor($el: any, parent?: any);
    checkbox(el: any, v: any): Promise<any>;
    click(el: any): Promise<any>;
    focus(el: any): Promise<any>;
    checkVisible(el: any): Promise<any>;
    blur(el: any): Promise<any>;
    check(el: any): Promise<any>;
    checkVal(el: any, v: any): Promise<any>;
    checkFocused(el: any): Promise<any>;
    checkEnabled(el: any): Promise<any>;
    checkHidden(el: any): Promise<any>;
    waitFinished(): Promise<any>;
}
export declare function waitFor(x: () => boolean, time?: any): Promise<never>;
export declare function renderTestElement(el: any): any;
