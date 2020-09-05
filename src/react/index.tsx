import * as React from 'react';
import { ItemsSource, Pager as NativeScriptPager, PagerItem as NativeScriptPagerItem } from '../';
import { registerElement } from 'react-nativescript';
import { Orientation } from '../';
registerElement('pager', () => require('../').Pager);
registerElement('pagerItem', () => require('../').PagerItem);

import { Template, Color } from '@nativescript/core';
import { PercentLength } from '@nativescript/core/ui/core/view';
import { View, KeyedTemplate } from "@nativescript/core";
import { render as RNSRender, unmountComponentAtNode, NSVRoot, NSVElement, ViewAttributes, NativeScriptProps, GridLayoutAttributes } from "react-nativescript";


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
    indicator: any
    showIndicator: boolean;
    indicatorColor: Color | string;
    indicatorSelectedColor: Color | string;
    ios?: any;
    android?: any;
};


export type CellViewContainer = View;
type CellFactory = (item: any) => React.ReactElement;

type OwnProps = {
    items: ItemsSource | any[];
    /** User may specify cellFactory for single-template or cellFactories for multi-template. */
    cellFactory?: CellFactory;
    cellFactories?: Map<string, { placeholderItem: any; cellFactory: CellFactory }>;

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
type Props = OwnProps & { forwardedRef?: React.RefObject<NSVElement<NativeScriptPager>> };

type NumberKey = number | string;
type RootKeyAndTNSView = { rootKey: string; nativeView: View };

interface State {
    nativeCells: Record<NumberKey, CellViewContainer>;
    /* Native cells may be rotated e.g. what once displayed items[0] may now need to display items[38] */
    nativeCellToItemIndex: Map<CellViewContainer, NumberKey>;
    itemIndexToNativeCell?: Map<NumberKey, CellViewContainer>;
}

export class _Pager extends React.Component<Props, State> {
    static readonly defaultProps = {
        _debug: {
            logLevel: "info" as "info",
            onCellFirstLoad: undefined,
            onCellRecycle: undefined,
        },
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            nativeCells: {},
            nativeCellToItemIndex: new Map(),
            itemIndexToNativeCell: props._debug.logLevel === "debug" ? new Map() : undefined,
        };
    }

    private readonly myRef = React.createRef<NSVElement<NativeScriptPager>>();
    private readonly argsViewToRootKeyAndRef: Map<View, RootKeyAndTNSView> = new Map();
    private roots: Set<string> = new Set();


    private readonly defaultOnItemLoading: (args: any) => void = (args: any) => {
        const { logLevel, onCellRecycle, onCellFirstLoad } = this.props._debug;
        const { items, itemTemplateSelector } = this.props;
        const item: any = _Pager.isItemsSource(items) ? items.getItem(args.index) : items[args.index];
        const template: string | null = itemTemplateSelector
            ? typeof itemTemplateSelector === "string"
                ? itemTemplateSelector
                : (itemTemplateSelector as ((item: any, index: number, items: any) => string))(item, args.index, items)
            : null;
        const cellFactory: CellFactory | undefined =
            template === null
                ? this.props.cellFactory
                : this.props.cellFactories
                    ? this.props.cellFactories.get(template).cellFactory
                    : this.props.cellFactory;

        if (typeof cellFactory === "undefined") {
            console.warn(`Pager: No cell factory found, given template ${template}!`);
            return;
        }

        let view: View | undefined = args.view;
        if (!view) {
            const rootKeyAndRef: RootKeyAndTNSView = this.renderNewRoot(item, cellFactory);

            args.view = rootKeyAndRef.nativeView;

            /* Here we're re-using the ref - I assume this is best practice. If not, we can make a new one on each update instead. */
            this.argsViewToRootKeyAndRef.set(args.view, rootKeyAndRef);

            if (onCellFirstLoad) onCellFirstLoad(rootKeyAndRef.nativeView);
        } else {
            console.log(`[Pager] existing view: `, view);
            if (onCellRecycle) onCellRecycle(view as CellViewContainer);

            const { rootKey, nativeView } = this.argsViewToRootKeyAndRef.get(view);
            if (typeof rootKey === "undefined") {
                console.error(`Unable to find root key that args.view corresponds to!`, view);
                return;
            }
            if (!nativeView) {
                console.error(`Unable to find ref that args.view corresponds to!`, view);
                return;
            }

            // args.view = null;
            RNSRender(
                cellFactory(item),
                null,
                () => {
                    // console.log(`Rendered into cell! detachedRootRef:`);
                },
                rootKey
            );
        }
    };

    protected getNativeView(): NativeScriptPager | null {
        const ref = (this.props.forwardedRef || this.myRef);
        return ref.current ? ref.current.nativeView : null;
    }

    private readonly renderNewRoot = (item: any, cellFactory: CellFactory): RootKeyAndTNSView => {
        const node: NativeScriptPager | null = this.getNativeView();
        if (!node) {
            throw new Error("Unable to get ref to Pager");
        }

        console.log(`[Pager] no existing view.`);
        const rootKey: string = `Pager-${node._domId}-${this.roots.size.toString()}`;

        const root = new NSVRoot<View>();
        RNSRender(
            cellFactory(item),
            root, () => {
                // console.log(`Rendered into cell! ref:`);
            },
            rootKey
        );

        this.roots.add(rootKey);

        return {
            rootKey,
            nativeView: root.baseRef.nativeView
        };
    };

    componentDidMount() {
        const node: NativeScriptPager | null = this.getNativeView();
        if (!node) {
            console.warn(`React ref to NativeScript View lost, so unable to set item templates.`);
            return;
        }

        /* NOTE: does not support updating of this.props.cellFactories upon Props update. */
        if (this.props.cellFactories) {
            const itemTemplates: KeyedTemplate[] = [];
            this.props.cellFactories.forEach((info, key: string) => {
                const { placeholderItem, cellFactory } = info;
                itemTemplates.push({
                    key,
                    createView: () => {
                        console.log(`[Pager] item template "${key}"`);
                        const rootKeyAndRef: RootKeyAndTNSView = this.renderNewRoot(placeholderItem, cellFactory);
                        this.argsViewToRootKeyAndRef.set(rootKeyAndRef.nativeView, rootKeyAndRef);

                        return rootKeyAndRef.nativeView;
                    },
                });
            });
            node.itemTemplates = itemTemplates;
        }
    }

    componentWillUnmount() {
        this.roots.forEach(root => unmountComponentAtNode(root));
    }

    public static isItemsSource(arr: any[] | ItemsSource): arr is ItemsSource {
        // Same implementation as: https://github.com/NativeScript/NativeScript/blob/b436ecde3605b695a0ffa1757e38cc094e2fe311/tns-core-modules/ui/list-picker/list-picker-common.ts#L74
        return typeof (arr as ItemsSource).getItem === "function";
    }



    render() {
        console.log(`Pager's render()`);
        const {
            // Only used by the class component; not the JSX element.
            forwardedRef,
            children,
            _debug,
            cellFactories,
            cellFactory,

            ...rest
        } = this.props;

        return (
            // React.createElement('pager',{
            //     className: 'pager-group',
            //     ...rest,
            //     ref: forwardedRef || this.myRef,
            //     onItemLoading: this.defaultOnItemLoading
            // }, children)
            <pager
                {...rest}
                onItemLoading={this.defaultOnItemLoading}
                ref={forwardedRef || this.myRef}
                children={children}
            />
        );
    }
}

export type PagerItemAttributes = GridLayoutAttributes & {forwardedRef?: React.RefObject<any> };

export class _PagerItem extends React.Component<PagerItemAttributes, {}> {
    private readonly myRef = React.createRef<NSVElement<NativeScriptPagerItem>>();
    private readonly item = new NativeScriptPagerItem();

    componentDidMount(): void {
        const {forwardedRef} = this.props;
        const view = (forwardedRef || this.myRef).current!.nativeView;
        const parent: any = view && view.parent ? view.parent : null;
        if (parent) {
            // remove parent
            parent._removeView(view);
            // add to item;
            this.item.addChild(view);
            // @ts-ignore
            parent._addChildFromBuilder('PagerItem', this.item);
        }
    }

    render() {
        const {
            forwardedRef,

            onPropertyChange,

            children,
            // view, /* We disallow this at the typings level. */
            ...rest
        } = this.props;


        return React.createElement(
            'pagerItem',
            {
                ...rest,
                ref: forwardedRef || this.myRef,
            },
            children
        );
    }
}

export const Pager = React.forwardRef<NSVElement<NativeScriptPager>, OwnProps>(
    (props: OwnProps, ref: React.RefObject<NSVElement<NativeScriptPager>>) => {
        return <_Pager {...props} forwardedRef={ref} />;
    }
);


export const PagerItem = React.forwardRef<NSVElement<NativeScriptPagerItem>, PagerItemAttributes>(
    (props: PagerItemAttributes, ref: React.RefObject<NSVElement<NativeScriptPagerItem>>) => {
        return <_PagerItem {...props} forwardedRef={ref} />;
    }
);



declare global {
    module JSX {
        interface IntrinsicElements {
            pager: NativeScriptProps<PagerAttributes, NativeScriptPager>;
            pagerItem: NativeScriptProps<PagerItemAttributes, NativeScriptPagerItem>
        }
    }
}