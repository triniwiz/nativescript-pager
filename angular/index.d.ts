import { ElementRef, TemplateRef, IterableDiffers, ChangeDetectorRef, ViewContainerRef } from "@angular/core";
import { View } from "ui/core/view";
export declare const ITEMSLOADING = "itemsLoading";
export interface ComponentView {
    rootNodes: Array<any>;
    destroy(): void;
}
export declare type RootLocator = (nodes: Array<any>, nestLevel: number) => View;
export declare function getItemViewRoot(viewRef: ComponentView, rootLocator?: RootLocator): View;
export declare class PagerItemTemplate {
    private owner;
    private templateRef;
    constructor(owner: PagerComponent, templateRef: TemplateRef<any>);
}
export declare class PagerComponent {
    private _iterableDiffers;
    private _cdr;
    private loader;
    private viewInitialized;
    private _selectedIndex;
    private _items;
    private _differ;
    private pager;
    itemTemplate: TemplateRef<PagerItemContext>;
    constructor(el: ElementRef, _iterableDiffers: IterableDiffers, _cdr: ChangeDetectorRef, loader: ViewContainerRef);
    items: any;
    selectedIndex: number;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    itemsLoading(args: any): void;
    setupViewRef(viewRef: any, data: any, index: any): void;
    detectChangesOnChild(viewRef: any, index: any): void;
    ngDoCheck(): void;
}
export declare class PagerItemContext {
    $implicit: any;
    item: any;
    index: number;
    even: boolean;
    odd: boolean;
    constructor($implicit?: any, item?: any, index?: number, even?: boolean, odd?: boolean);
}
export declare class PagerModule {
}
