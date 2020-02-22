import * as React from 'react';
import { ItemsSource, Pager as NativeScriptPager } from '../pager';
import { ContentView } from 'tns-core-modules/ui/page/page';
import { PropsWithoutForwardedRef, ViewProps } from 'react-nativescript/dist/shared/NativeScriptComponentTypings';
import { ViewComponentProps, ViewComponentState } from 'react-nativescript/dist/components/View';
import { RCTContainerView } from 'react-nativescript/dist/components/ContainerView';
import { ItemEventData } from '../pager.common';
export declare type CellViewContainer = ContentView;
declare type CellFactory = (item: any, ref: React.RefObject<any>) => React.ReactElement;
export declare type PagerProps = ViewProps & Pick<NativeScriptPager, 'items' | 'selectedIndex' | 'itemTemplate' | 'itemTemplates' | 'canGoRight' | 'canGoLeft' | 'spacing' | 'peaking' | 'perPage' | 'orientation' | 'transformers' | 'loadMoreCount' | 'disableSwipe' | 'showIndicator' | 'itemTemplateSelector' | 'itemIdGenerator' | 'ios' | 'android'>;
interface Props {
    items?: PagerProps['items'];
    cellFactory?: CellFactory;
    cellFactories?: Map<string, {
        placeholderItem: any;
        cellFactory: CellFactory;
    }>;
    onLoadMoreItems?: (args: ItemEventData) => void;
    onSelectedIndexChange?(args: any): void;
    _debug?: {
        logLevel: 'debug' | 'info';
        onCellFirstLoad?: (container: CellViewContainer) => void;
        onCellRecycle?: (container: CellViewContainer) => void;
    };
}
declare type NumberKey = number | string;
interface State {
    nativeCells: Record<NumberKey, CellViewContainer>;
    nativeCellToItemIndex: Map<CellViewContainer, NumberKey>;
    itemIndexToNativeCell?: Map<NumberKey, CellViewContainer>;
}
export declare type PagerComponentProps<E extends NativeScriptPager = NativeScriptPager> = Props & Partial<PagerProps> & ViewComponentProps<E>;
export declare type PagerComponentState = State & ViewComponentState;
export declare class _Pager<P extends PagerComponentProps<E>, S extends PagerComponentState, E extends NativeScriptPager> extends RCTContainerView<P, S, E> {
    static readonly defaultProps: {
        _debug: {
            logLevel: "info";
            onCellFirstLoad: any;
            onCellRecycle: any;
        };
    };
    constructor(props: P);
    private readonly argsViewToRootKeyAndRef;
    private roots;
    private readonly defaultOnItemLoading;
    protected updateListeners(node: E, attach: boolean | null, nextProps?: P): void;
    private readonly renderNewRoot;
    componentDidMount(): void;
    componentWillUnmount(): void;
    static isItemsSource(arr: any[] | ItemsSource): arr is ItemsSource;
    render(): React.ReactElement<{
        className: string;
    } & Pick<Readonly<P> & Readonly<{
        children?: React.ReactNode;
    }>, Exclude<keyof P, "items" | "onLoaded" | "forwardedRef" | "onPropertyChange" | "children" | "onUnloaded" | "onAndroidBackPressed" | "onShowingModally" | "onShownModally" | "onTap" | "onDoubleTap" | "onPinch" | "onPan" | "onSwipe" | "onRotation" | "onLongPress" | "onTouch" | "_debug">> & {
        items: P["items"];
        ref: P["forwardedRef"];
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
}
declare type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<PagerComponentProps<NativeScriptPager>>;
export declare const $Pager: React.ComponentType<OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptPager>>;
export * from './pager-item';
