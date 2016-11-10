import { ElementRef, TemplateRef, ViewContainerRef } from "@angular/core";
import { Pager } from "../pager";
export declare class PagerDirective {
    private element;
    pager: Pager;
    private _selectedIndex;
    private viewInitialized;
    selectedIndex: number;
    constructor(element: ElementRef);
    ngAfterViewInit(): void;
}
export declare class PagerItemDirective {
    private owner;
    private templateRef;
    private viewContainer;
    private item;
    constructor(owner: PagerDirective, templateRef: TemplateRef<any>, viewContainer: ViewContainerRef);
    private ensureItem();
    ngOnInit(): void;
}
