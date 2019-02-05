import { AfterContentInit, DoCheck, ElementRef, EmbeddedViewRef, EventEmitter, InjectionToken, IterableDiffer, IterableDiffers, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ItemEventData, ItemsSource } from 'tns-core-modules/ui/list-view';
import { KeyedTemplate, View } from 'tns-core-modules/ui/core/view';
import { EventData, Template } from 'tns-core-modules/ui/layouts/layout-base';
import { Pager } from '../pager';
export interface PagerTemplatedItemsView {
    items: any[] | ItemsSource;
    itemTemplate: string | Template;
    itemTemplates?: string | Array<KeyedTemplate>;
    refresh(): void;
    on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any): any;
    off(event: 'itemLoading', callback: (args: EventData) => void, thisArg?: any): any;
}
export declare class ItemContext {
    $implicit?: any;
    item?: any;
    index?: number;
    even?: boolean;
    odd?: boolean;
    constructor($implicit?: any, item?: any, index?: number, even?: boolean, odd?: boolean);
}
export interface SetupItemViewArgs {
    view: EmbeddedViewRef<any>;
    data: any;
    index: number;
    context: ItemContext;
}
export declare abstract class TemplatedItemsComponent implements DoCheck, OnDestroy, AfterContentInit {
    private _iterableDiffers;
    abstract readonly nativeElement: Pager;
    protected templatedItemsView: Pager;
    protected _items: any;
    protected _differ: IterableDiffer<KeyedTemplate>;
    protected _templateMap: Map<string, KeyedTemplate>;
    private _selectedIndex;
    loader: ViewContainerRef;
    setupItemView: EventEmitter<SetupItemViewArgs>;
    itemTemplateQuery: TemplateRef<ItemContext>;
    itemTemplate: TemplateRef<ItemContext>;
    items: any;
    selectedIndex: number;
    ngAfterViewInit(): void;
    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    private setItemTemplates;
    registerTemplate(key: string, template: TemplateRef<ItemContext>): void;
    onItemLoading(args: ItemEventData): void;
    setupViewRef(viewRef: EmbeddedViewRef<ItemContext>, data: any, index: number): void;
    protected getItemTemplateViewFactory(template: TemplateRef<ItemContext>): () => View;
    private detectChangesOnChild;
    ngDoCheck(): void;
}
export interface ComponentView {
    rootNodes: Array<any>;
    destroy(): void;
}
export declare type RootLocator = (nodes: Array<any>, nestLevel: number) => View;
export declare function getItemViewRoot(viewRef: ComponentView, rootLocator?: RootLocator): View;
export declare const TEMPLATED_ITEMS_COMPONENT: InjectionToken<TemplatedItemsComponent>;
export declare class PagerItemDirective implements OnInit {
    private templateRef;
    private owner;
    private viewContainer;
    private item;
    constructor(templateRef: TemplateRef<any>, owner: TemplatedItemsComponent, viewContainer: ViewContainerRef);
    private ensureItem;
    private applyConfig;
    ngOnInit(): void;
}
export declare class TemplateKeyDirective {
    private templateRef;
    private comp;
    constructor(templateRef: TemplateRef<any>, comp: TemplatedItemsComponent);
    pagerTemplateKey: any;
}
