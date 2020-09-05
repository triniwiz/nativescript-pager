import * as React from 'react';
import { ItemsSource, Pager as NativeScriptPager, PagerItem as NativeScriptPagerItem } from '../';
import { Orientation } from '../';
import { Template, Color } from '@nativescript/core';
import { PercentLength } from '@nativescript/core';
import { View, KeyedTemplate } from "@nativescript/core";
import { NSVElement, ViewAttributes, NativeScriptProps, GridLayoutAttributes } from "react-nativescript";
export declare type PagerAttributes = ViewAttributes & {
    items?: any;
    selectedIndex: number;
    onItemLoading?: (args: any) => void;
    itemIdGenerator?: (item: any, index: number, items: any) => number;
    itemTemplate?: string | Template;
    itemTemplateSelector?: string | ((item: any, index: number, items: any) => string);
    itemTemplates?: string | KeyedTemplate[];
    canGoRight: boolean;
    canGoLeft: boolean;
    spacing: PercentLength | string;
    peaking: PercentLength | string;
    perPage: number;
    orientation: Orientation;
    transformers: string;
    loadMoreCount: number;
    disableSwipe: boolean;
    indicator: any;
    showIndicator: boolean;
    indicatorColor: Color | string;
    indicatorSelectedColor: Color | string;
    ios?: any;
    android?: any;
};
export declare type CellViewContainer = View;
declare type CellFactory = (item: any) => React.ReactElement;
declare type OwnProps = {
    items: ItemsSource | any[];
    cellFactory?: CellFactory;
    cellFactories?: Map<string, {
        placeholderItem: any;
        cellFactory: CellFactory;
    }>;
    onSelectedIndexChange?(args: any): void;
    onSelectedIndexChanged?(args: any): void;
    scroll?(args: any): void;
    swipe?(args: any): void;
    swipeStart?(args: any): void;
    swipeOver?(args: any): void;
    swipeEnd?(args: any): void;
    onLoadMoreItems?: (args: any) => void;
    _debug?: {
        logLevel: "debug" | "info";
        onCellFirstLoad?: (container: CellViewContainer) => void;
        onCellRecycle?: (container: CellViewContainer) => void;
    };
} & Omit<PagerAttributes, "onItemLoading">;
declare type Props = OwnProps & {
    forwardedRef?: React.RefObject<NSVElement<NativeScriptPager>>;
};
declare type NumberKey = number | string;
interface State {
    nativeCells: Record<NumberKey, CellViewContainer>;
    nativeCellToItemIndex: Map<CellViewContainer, NumberKey>;
    itemIndexToNativeCell?: Map<NumberKey, CellViewContainer>;
}
export declare class _Pager extends React.Component<Props, State> {
    static readonly defaultProps: {
        _debug: {
            logLevel: "info";
            onCellFirstLoad: any;
            onCellRecycle: any;
        };
    };
    constructor(props: Props);
    private readonly myRef;
    private readonly argsViewToRootKeyAndRef;
    private roots;
    private readonly defaultOnItemLoading;
    protected getNativeView(): NativeScriptPager | null;
    private readonly renderNewRoot;
    componentDidMount(): void;
    componentWillUnmount(): void;
    static isItemsSource(arr: any[] | ItemsSource): arr is ItemsSource;
    render(): any;
}
export declare type PagerItemAttributes = GridLayoutAttributes & {
    forwardedRef?: React.RefObject<any>;
};
export declare class _PagerItem extends React.Component<PagerItemAttributes, {}> {
    private readonly myRef;
    private readonly item;
    componentDidMount(): void;
    render(): any;
}
export declare const Pager: any;
export declare const PagerItem: any;
declare global {
    module JSX {
        interface IntrinsicElements {
            pager: NativeScriptProps<PagerAttributes, NativeScriptPager>;
            pagerItem: NativeScriptProps<PagerItemAttributes, NativeScriptPagerItem>;
        }
    }
}
export {};
