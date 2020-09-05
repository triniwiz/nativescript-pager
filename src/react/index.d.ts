import * as React from 'react';
import { ItemsSource, Pager as NativeScriptPager, PagerItem as NativeScriptPagerItem } from '../';
import { Orientation } from '../';
import { Template, Color } from '@nativescript/core';
import { PercentLength } from '@nativescript/core/ui/core/view';
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
    /** User may specify cellFactory for single-template or cellFactories for multi-template. */
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
    items: any[] | ItemsSource;
    /** User may specify cellFactory for single-template or cellFactories for multi-template. */
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
        onCellFirstLoad?: (container: View) => void;
        onCellRecycle?: (container: View) => void;
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
    left?: import("@nativescript/core/ui/styling/style-properties").Length;
    nativeView?: any;
    onAutomationTextChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onBindingContextChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onClassNameChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIdChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIosOverflowSafeAreaChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIosOverflowSafeAreaEnabledChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIsEnabledChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIsUserInteractionEnabledChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onOriginXChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onOriginYChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    order?: number;
    originX?: NumberKey;
    originY?: NumberKey;
    page?: import("@nativescript/core").Page;
    parent?: import("@nativescript/core").ViewBase;
    parentNode?: import("@nativescript/core").ViewBase;
    recycleNativeView?: "auto" | "always" | "never";
    row?: number;
    rowSpan?: number;
    top?: import("@nativescript/core/ui/styling/style-properties").Length;
    typeName?: string;
    viewController?: any;
} & {
    android?: any;
    androidDynamicElevationOffset?: NumberKey;
    androidElevation?: NumberKey;
    automationText?: string;
    background?: string;
    backgroundColor?: string | Color;
    backgroundImage?: string | import("@nativescript/core/ui/styling/gradient").LinearGradient;
    backgroundPosition?: string;
    backgroundRepeat?: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
    backgroundSize?: string;
    bindingContext?: any;
    borderBottomColor?: string | Color;
    borderBottomLeftRadius?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderBottomRightRadius?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderBottomWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderColor?: string | Color;
    borderLeftColor?: string | Color;
    borderLeftWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderRadius?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderRightColor?: string | Color;
    borderRightWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderTopColor?: string | Color;
    borderTopLeftRadius?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderTopRightRadius?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderTopWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    borderWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    color?: string | Color;
    column?: NumberKey;
    columnSpan?: NumberKey;
    css?: string;
    cssClasses?: Set<string>;
    cssPseudoClasses?: Set<string>;
    cssType?: string;
    dock?: "left" | "top" | "right" | "bottom";
    height?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    horizontalAlignment?: "left" | "right" | "center" | "stretch";
    ios?: any;
    iosOverflowSafeArea?: boolean;
    iosOverflowSafeAreaEnabled?: boolean;
    isEnabled?: boolean;
    isLayoutRequired?: boolean;
    isLayoutValid?: boolean;
    isUserInteractionEnabled?: boolean;
    left?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    margin?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    marginBottom?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    marginLeft?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    marginRight?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    marginTop?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
    minHeight?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    minWidth?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    modal?: View;
    onAndroidBackPressed?: (args: import("@nativescript/core").EventData) => void;
    onColumnChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onColumnSpanChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onDockChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onDoubleTap?: (arg: import("@nativescript/core").GestureEventData) => any;
    onLeftChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onLoaded?: (args: import("@nativescript/core").EventData) => void;
    onLongPress?: (arg: import("@nativescript/core").GestureEventData) => any;
    onPan?: (arg: import("@nativescript/core").PanGestureEventData) => any;
    onPinch?: (arg: import("@nativescript/core").PinchGestureEventData) => any;
    onRotation?: (arg: import("@nativescript/core").RotationGestureEventData) => any;
    onRowChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onRowSpanChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onShowingModally?: (args: import("@nativescript/core").ShownModallyData) => void;
    onShownModally?: (args: import("@nativescript/core").ShownModallyData) => void;
    onLayoutChanged?: (args: import("@nativescript/core").EventData) => void;
    onSwipe?: (arg: import("@nativescript/core").SwipeGestureEventData) => any;
    onTap?: (arg: import("@nativescript/core").GestureEventData) => any;
    onTopChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onTouch?: (arg: import("@nativescript/core").TouchGestureEventData) => any;
    onUnloaded?: (args: import("@nativescript/core").EventData) => void;
    opacity?: NumberKey;
    originX?: number;
    originY?: number;
    perspective?: NumberKey;
    rotate?: NumberKey;
    rotateX?: NumberKey;
    rotateY?: NumberKey;
    row?: NumberKey;
    rowSpan?: NumberKey;
    scaleX?: NumberKey;
    scaleY?: NumberKey;
    textTransform?: "none" | "initial" | "capitalize" | "uppercase" | "lowercase";
    top?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    translateX?: NumberKey;
    translateY?: NumberKey;
    verticalAlignment?: "top" | "bottom" | "stretch" | "middle";
    visibility?: "visible" | "hidden" | "collapse";
    width?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit | import("@nativescript/core/ui/styling/style-properties").LengthPercentUnit;
} & {
    iosOverflowSafeArea?: boolean;
} & {
    clipToBounds?: string | boolean;
    isPassThroughParentEnabled?: string | boolean;
    onClipToBoundsChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    onIsPassThroughParentEnabledChange?: (args: import("@nativescript/core").PropertyChangeData) => void;
    padding?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    paddingBottom?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    paddingLeft?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    paddingRight?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
    paddingTop?: string | number | import("@nativescript/core/ui/styling/style-properties").LengthDipUnit | import("@nativescript/core/ui/styling/style-properties").LengthPxUnit;
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
