import { AfterContentInit, DoCheck, ElementRef, EmbeddedViewRef, EventEmitter, InjectionToken, IterableDiffer, IterableDiffers, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { ItemEventData, ItemsSource } from 'tns-core-modules/ui/list-view';
import { View, KeyedTemplate } from 'tns-core-modules/ui/core/view';
import { Template, EventData } from 'tns-core-modules/ui/layouts/layout-base';
import { Pager } from '..';
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
    loader: ViewContainerRef;
    setupItemView: EventEmitter<SetupItemViewArgs>;
    itemTemplateQuery: TemplateRef<ItemContext>;
    itemTemplate: TemplateRef<ItemContext>;
    items: any;
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
export declare class TemplateKeyDirective {
    private templateRef;
    private comp;
    constructor(templateRef: TemplateRef<any>, comp: TemplatedItemsComponent);
    nsTemplateKey: any;
}
