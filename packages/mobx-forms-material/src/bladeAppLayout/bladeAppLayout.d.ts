/// <reference types="react" />
import { IComponent } from '../common/ui-attr';
import { BladePanel } from '../bladepanel/bladePanel';
export declare class AppMenuItem {
    private text;
    private icon;
    isSelected: any;
    private parent;
    private route;
    constructor(text: any, icon: any, route: any, parent: BladeAppLayout);
    render(): JSX.Element;
}
export declare class BladeAppLayout {
    menuItems: IComponent[];
    bladePanel: BladePanel;
    addItem(text: any, icon: any, route: any): void;
    render(): JSX.Element;
}
