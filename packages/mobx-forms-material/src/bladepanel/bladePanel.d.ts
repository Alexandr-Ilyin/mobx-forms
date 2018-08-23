/// <reference types="react" />
import { IComponent } from '../common/ui-attr';
declare class BladeMatchPanel {
    route: BladeRouteCfg;
    cmp: IComponent;
    segment: string;
    params: any;
    collapsed: boolean;
}
interface BladeRouteCfg {
    makeCmp: (params?: any) => IComponent;
    path: any;
    style?: any;
    title?: any;
    isDefault?: boolean;
}
export declare function pushBlade(blade: any, history: any): void;
export declare class BladePanel {
    private _panels;
    private rules;
    private history;
    readonly panels: BladeMatchPanel[];
    addRoute(cfg: BladeRouteCfg): void;
    closeBlade(closed: any): void;
    private getMatches;
    connectToHistory(history: any): void;
    replace(segment: any, replaced: any): void;
    pushAfter(segment: any, afterCmp: any): void;
    push(path: any): void;
    updatePanels(path: any): void;
    render(): JSX.Element;
    remove(e: BladeMatchPanel): void;
}
export {};
