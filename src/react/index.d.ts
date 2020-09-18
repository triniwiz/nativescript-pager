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
    render(): JSX.Element;
}
export declare type PagerItemAttributes = GridLayoutAttributes & {
    forwardedRef?: React.RefObject<any>;
};
export declare class _PagerItem extends React.Component<PagerItemAttributes, {}> {
    private readonly myRef;
    private readonly item;
    componentDidMount(): void;
    render(): React.DOMElement<React.DOMAttributes<any>, any>;
}
export declare const Pager: React.ForwardRefExoticComponent<{
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
} & Pick<PagerAttributes, "itemTemplate" | "itemTemplates" | "items" | "itemTemplateSelector" | "itemIdGenerator" | "left" | "top" | "indicatorColor" | "indicatorSelectedColor" | "indicator" | "selectedIndex" | "spacing" | "peaking" | "canGoRight" | "canGoLeft" | "orientation" | "disableSwipe" | "perPage" | "transformers" | "showIndicator" | "onPropertyChange" | "alignSelf" | "android" | "automationText" | "bindingContext" | "className" | "col" | "colSpan" | "column" | "columnSpan" | "cssClasses" | "cssPseudoClasses" | "dock" | "domNode" | "effectiveBorderBottomWidth" | "effectiveBorderLeftWidth" | "effectiveBorderRightWidth" | "effectiveBorderTopWidth" | "effectiveHeight" | "effectiveLeft" | "effectiveMarginBottom" | "effectiveMarginLeft" | "effectiveMarginRight" | "effectiveMarginTop" | "effectiveMinHeight" | "effectiveMinWidth" | "effectivePaddingBottom" | "effectivePaddingLeft" | "effectivePaddingRight" | "effectivePaddingTop" | "effectiveTop" | "effectiveWidth" | "flexGrow" | "flexShrink" | "flexWrapBefore" | "id" | "ios" | "iosOverflowSafeArea" | "iosOverflowSafeAreaEnabled" | "isCollapsed" | "isEnabled" | "isLoaded" | "isUserInteractionEnabled" | "nativeView" | "onAutomationTextChange" | "onBindingContextChange" | "onClassNameChange" | "onIdChange" | "onIosOverflowSafeAreaChange" | "onIosOverflowSafeAreaEnabledChange" | "onIsEnabledChange" | "onIsUserInteractionEnabledChange" | "onOriginXChange" | "onOriginYChange" | "order" | "originX" | "originY" | "page" | "parent" | "parentNode" | "recycleNativeView" | "row" | "rowSpan" | "typeName" | "viewController" | "androidDynamicElevationOffset" | "androidElevation" | "background" | "backgroundColor" | "backgroundImage" | "backgroundPosition" | "backgroundRepeat" | "backgroundSize" | "borderBottomColor" | "borderBottomLeftRadius" | "borderBottomRightRadius" | "borderBottomWidth" | "borderColor" | "borderLeftColor" | "borderLeftWidth" | "borderRadius" | "borderRightColor" | "borderRightWidth" | "borderTopColor" | "borderTopLeftRadius" | "borderTopRightRadius" | "borderTopWidth" | "borderWidth" | "color" | "css" | "cssType" | "height" | "horizontalAlignment" | "isLayoutRequired" | "isLayoutValid" | "margin" | "marginBottom" | "marginLeft" | "marginRight" | "marginTop" | "minHeight" | "minWidth" | "modal" | "onAndroidBackPressed" | "onColumnChange" | "onColumnSpanChange" | "onDockChange" | "onDoubleTap" | "onLeftChange" | "onLoaded" | "onLongPress" | "onPan" | "onPinch" | "onRotation" | "onRowChange" | "onRowSpanChange" | "onShowingModally" | "onShownModally" | "onLayoutChanged" | "onSwipe" | "onTap" | "onTopChange" | "onTouch" | "onUnloaded" | "opacity" | "perspective" | "rotate" | "rotateX" | "rotateY" | "scaleX" | "scaleY" | "textTransform" | "translateX" | "translateY" | "verticalAlignment" | "visibility" | "width" | "loadMoreCount"> & React.RefAttributes<NSVElement<NativeScriptPager>>>;
export declare const PagerItem: React.ForwardRefExoticComponent<import("react-nativescript/dist/lib/react-nativescript-jsx").ObservableAttributes & {
    alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
    android?: any;
    automationText?: string;
    bindingContext?: any;
    className?: string;
    col?: number;
    colSpan?: number;
    column?: number;
    columnSpan?: number;
    cssClasses?: Set<string>;
    cssPseudoClasses?: Set<string>;
    dock?: "left" | "top" | "right" | "bottom";
    domNode?: import("@nativescript/core/debugger/dom-node").DOMNode;
    effectiveBorderBottomWidth?: number;
    effectiveBorderLeftWidth?: number;
    effectiveBorderRightWidth?: number;
    effectiveBorderTopWidth?: number;
    effectiveHeight?: number;
    effectiveLeft?: number;
    effectiveMarginBottom?: number;
    effectiveMarginLeft?: number;
    effectiveMarginRight?: number;
    effectiveMarginTop?: number;
    effectiveMinHeight?: number;
    effectiveMinWidth?: number;
    effectivePaddingBottom?: number;
    effectivePaddingLeft?: number;
    effectivePaddingRight?: number;
    effectivePaddingTop?: number;
    effectiveTop?: number;
    effectiveWidth?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexWrapBefore?: boolean;
    id?: string;
    ios?: any;
    iosOverflowSafeArea?: string | boolean;
    iosOverflowSafeAreaEnabled?: string | boolean;
    isCollapsed?: boolean;
    isEnabled?: string | boolean;
    isLoaded?: boolean;
    isUserInteractionEnabled?: string | boolean;
    left?: import("@nativescript/core").Length;
    nativeView?: any;
    onAutomationTextChange?: (args: any) => void;
    onBindingContextChange?: (args: any) => void;
    onClassNameChange?: (args: any) => void;
    onIdChange?: (args: any) => void;
    onIosOverflowSafeAreaChange?: (args: any) => void;
    onIosOverflowSafeAreaEnabledChange?: (args: any) => void;
    onIsEnabledChange?: (args: any) => void;
    onIsUserInteractionEnabledChange?: (args: any) => void;
    onOriginXChange?: (args: any) => void;
    onOriginYChange?: (args: any) => void;
    order?: number;
    originX?: string | number;
    originY?: string | number;
    page?: any;
    parent?: any;
    parentNode?: any;
    recycleNativeView?: "auto" | "always" | "never";
    row?: number;
    rowSpan?: number;
    top?: import("@nativescript/core").Length;
    typeName?: string;
    viewController?: any;
} & {
    android?: any;
    androidDynamicElevationOffset?: string | number;
    androidElevation?: string | number;
    automationText?: string;
    background?: string;
    backgroundColor?: any;
    backgroundImage?: string | import("@nativescript/core/ui/styling/gradient").LinearGradient;
    backgroundPosition?: string;
    backgroundRepeat?: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
    backgroundSize?: string;
    bindingContext?: any;
    borderBottomColor?: any;
    borderBottomLeftRadius?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderBottomRightRadius?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderBottomWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderColor?: any;
    borderLeftColor?: any;
    borderLeftWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderRadius?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderRightColor?: any;
    borderRightWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderTopColor?: any;
    borderTopLeftRadius?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderTopRightRadius?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderTopWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    borderWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    color?: any;
    column?: string | number;
    columnSpan?: string | number;
    css?: string;
    cssClasses?: Set<string>;
    cssPseudoClasses?: Set<string>;
    cssType?: string;
    dock?: "left" | "top" | "right" | "bottom";
    height?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    horizontalAlignment?: "left" | "right" | "center" | "stretch";
    ios?: any;
    iosOverflowSafeArea?: boolean;
    iosOverflowSafeAreaEnabled?: boolean;
    isEnabled?: boolean;
    isLayoutRequired?: boolean;
    isLayoutValid?: boolean;
    isUserInteractionEnabled?: boolean;
    left?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    margin?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    marginBottom?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    marginLeft?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    marginRight?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    marginTop?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
    minHeight?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    minWidth?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    modal?: any;
    onAndroidBackPressed?: (args: any) => void;
    onColumnChange?: (args: any) => void;
    onColumnSpanChange?: (args: any) => void;
    onDockChange?: (args: any) => void;
    onDoubleTap?: (arg: any) => any;
    onLeftChange?: (args: any) => void;
    onLoaded?: (args: any) => void;
    onLongPress?: (arg: any) => any;
    onPan?: (arg: any) => any;
    onPinch?: (arg: any) => any;
    onRotation?: (arg: any) => any;
    onRowChange?: (args: any) => void;
    onRowSpanChange?: (args: any) => void;
    onShowingModally?: (args: any) => void;
    onShownModally?: (args: any) => void;
    onLayoutChanged?: (args: any) => void;
    onSwipe?: (arg: any) => any;
    onTap?: (arg: any) => any;
    onTopChange?: (args: any) => void;
    onTouch?: (arg: any) => any;
    onUnloaded?: (args: any) => void;
    opacity?: string | number;
    originX?: number;
    originY?: number;
    perspective?: string | number;
    rotate?: string | number;
    rotateX?: string | number;
    rotateY?: string | number;
    row?: string | number;
    rowSpan?: string | number;
    scaleX?: string | number;
    scaleY?: string | number;
    textTransform?: "none" | "initial" | "capitalize" | "uppercase" | "lowercase";
    top?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    translateX?: string | number;
    translateY?: string | number;
    verticalAlignment?: "top" | "bottom" | "stretch" | "middle";
    visibility?: "visible" | "hidden" | "collapse";
    width?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit | import("@nativescript/core").LengthPercentUnit;
} & {
    iosOverflowSafeArea?: boolean;
} & {
    clipToBounds?: string | boolean;
    isPassThroughParentEnabled?: string | boolean;
    onClipToBoundsChange?: (args: any) => void;
    onIsPassThroughParentEnabledChange?: (args: any) => void;
    padding?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    paddingBottom?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    paddingLeft?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    paddingRight?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
    paddingTop?: string | number | import("@nativescript/core").LengthDipUnit | import("@nativescript/core").LengthPxUnit;
} & {
    columns?: string;
    rows?: string;
} & {
    forwardedRef?: React.RefObject<any>;
} & React.RefAttributes<NSVElement<NativeScriptPagerItem>>>;
declare global {
    module JSX {
        interface IntrinsicElements {
            pager: NativeScriptProps<PagerAttributes, NativeScriptPager>;
            pagerItem: NativeScriptProps<PagerItemAttributes, NativeScriptPagerItem>;
        }
    }
}
export {};
