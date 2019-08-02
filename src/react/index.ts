import * as React from 'react';
import { ItemsSource, Pager as NativeScriptPager } from '../pager';
import { View } from 'tns-core-modules/ui/core/view/view';
import { ContentView, KeyedTemplate } from 'tns-core-modules/ui/page/page';
import * as ReactNativeScript from 'react-nativescript';
import { PropsWithoutForwardedRef, ViewProps } from 'react-nativescript/dist/shared/NativeScriptComponentTypings';
import { RCTView, ViewComponentProps, ViewComponentState } from 'react-nativescript/dist/components/View';
import { updateListener } from 'react-nativescript/dist/client/EventHandling';
import { elementMap } from 'react-nativescript/dist/client/ElementRegistry';

export type CellViewContainer = ContentView;
type CellFactory = (item: any, ref: React.RefObject<any>) => React.ReactElement;

export type PagerProps = ViewProps & Pick<NativeScriptPager,
    | 'items'
    | 'selectedIndex'
    | 'itemTemplate'
    | 'itemTemplates'
    | 'canGoRight'
    | 'canGoLeft'
    | 'spacing'
    | 'peaking'
    | 'perPage'
    | 'orientation'
    | 'transformers'
    | 'loadMoreCount'
    | 'disableSwipe'
    | 'showIndicator'
    | 'itemTemplateSelector'
    | 'itemIdGenerator'
    | 'ios'
    | 'android'>;


interface Props {
    items: PagerProps['items'];
    /* User may specify cellFactory for single-template or cellFactories for multi-template. */
    cellFactory?: CellFactory;
    cellFactories?: Map<string, { placeholderItem: any; cellFactory: CellFactory }>;
    /* For now, we don't support custom onItemLoading event handlers. */
    // onItemLoading?: (args: ItemEventData) => void,
    /**
     * The event will be raised when the ListView is scrolled so that the last item is visible.
     * This event is intended to be used to add additional data in the ListView.
     */
    onLoadMoreItems?: (args: ItemEventData) => void;

    onSelectedIndexChange?(args: any): void;

    _debug?: {
        logLevel: 'debug' | 'info';
        onCellFirstLoad?: (container: CellViewContainer) => void;
        onCellRecycle?: (container: CellViewContainer) => void;
    };
}

type NumberKey = number | string;
type RootKeyAndRef = { rootKey: string; ref: React.RefObject<any> };

interface State {
    nativeCells: Record<NumberKey, CellViewContainer>;
    /* Native cells may be rotated e.g. what once displayed items[0] may now need to display items[38] */
    nativeCellToItemIndex: Map<CellViewContainer, NumberKey>;
    itemIndexToNativeCell?: Map<NumberKey, CellViewContainer>;
}

export type PagerComponentProps<E extends NativeScriptPager = NativeScriptPager> =
    Props /* & typeof _Pager.defaultProps */
    & Partial<PagerProps>
    & ViewComponentProps<E>;

export type PagerComponentState = State & ViewComponentState;

// tslint:disable-next-line:class-name
export class _Pager<P extends PagerComponentProps<E>,
    S extends PagerComponentState,
    E extends NativeScriptPager> extends RCTView<P, S, E> {
    static readonly defaultProps = {
        _debug: {
            logLevel: 'info' as 'info',
            onCellFirstLoad: undefined,
            onCellRecycle: undefined,
        },
    };

    constructor(props: P) {
        super(props);
        this.state = {
            nativeCells: {},
            nativeCellToItemIndex: new Map(),
            itemIndexToNativeCell: props._debug.logLevel === 'debug' ? new Map() : undefined,
        } as Readonly<S>; // No idea why I need to assert as Readonly<S> when using generics with State :(
    }

    private readonly argsViewToRootKeyAndRef: Map<View, RootKeyAndRef> = new Map();
    private roots: Set<string> = new Set();

    private readonly defaultOnItemLoading: (args: any) => void = (args: any) => {
        const {logLevel, onCellRecycle, onCellFirstLoad} = this.props._debug;
        const {items, itemTemplateSelector} = this.props;
        const item: any = _Pager.isItemsSource(items) ? (items as any).getItem(args.index) : items[args.index];
        const template: string | null = itemTemplateSelector
            ? typeof itemTemplateSelector === 'string'
                ? itemTemplateSelector
                : (itemTemplateSelector as ((item: any, index: number, items: any) => string))(item, args.index, items)
            : null;
        const cellFactory: CellFactory | undefined =
            template === null
                ? this.props.cellFactory
                : this.props.cellFactories
                ? this.props.cellFactories.get(template).cellFactory
                : this.props.cellFactory;

        if (typeof cellFactory === 'undefined') {
            console.warn(`Pager: No cell factory found, given template ${template}!`);
            return;
        }

        console.log('loading', args.view);
        let view: View | undefined = args.view;
        if (!view) {
            const rootKeyAndRef: RootKeyAndRef = this.renderNewRoot(item, cellFactory);

            args.view = rootKeyAndRef.ref.current;

            /* Here we're re-using the ref - I assume this is best practice. If not, we can make a new one on each update instead. */
            this.argsViewToRootKeyAndRef.set(args.view, rootKeyAndRef);

            if (onCellFirstLoad) onCellFirstLoad(rootKeyAndRef.ref.current);
        } else {
            console.log(`[Pager] existing view: `, view);
            if (onCellRecycle) onCellRecycle(view as CellViewContainer);

            const {rootKey, ref} = this.argsViewToRootKeyAndRef.get(view);
            if (typeof rootKey === 'undefined') {
                console.error(`Unable to find root key that args.view corresponds to!`, view);
                return;
            }
            if (typeof ref === 'undefined') {
                console.error(`Unable to find ref that args.view corresponds to!`, view);
                return;
            }

            // args.view = null;
            ReactNativeScript.render(
                cellFactory(item, ref),
                null,
                () => {
                    // console.log(`Rendered into cell! detachedRootRef:`);
                },
                rootKey
            );
        }
    }

    /**
     *
     * @param attach true: attach; false: detach; null: update
     */
    protected updateListeners(node: E, attach: boolean | null, nextProps?: P): void {
        super.updateListeners(node, attach, nextProps);

        if (attach === null) {
            /* We won't support non-default onItemLoading event handlers. */
            // updateListener(node, NativeScriptListView.itemLoadingEvent, this.defaultOnItemLoading, nextProps.onLoaded);

            updateListener(
                node,
                'selectedIndexChange',
                this.props.onSelectedIndexChange,
                nextProps.onSelectedIndexChange
            );
            updateListener(
                node,
                NativeScriptPager.loadMoreItemsEvent,
                this.props.onLoadMoreItems,
                nextProps.onLoadMoreItems
            );
        } else {
            const method = (attach ? node.on : node.off).bind(node);
            /* if(this.props.onItemLoadingEvent) */
            method(
                NativeScriptPager.itemLoadingEvent,
                this.defaultOnItemLoading
            );

            if (this.props.onSelectedIndexChange) method('selectedIndexChanged', this.props.onSelectedIndexChange);
            if (this.props.onLoadMoreItems) method(NativeScriptPager.loadMoreItemsEvent, this.props.onLoadMoreItems);
        }
    }

    private readonly renderNewRoot = (item: any, cellFactory: CellFactory): RootKeyAndRef => {
        console.log(`[Pager] no existing view.`);
        const ref: React.RefObject<any> = React.createRef<any>();
        const rootKey: string = 'Pager-' + this.roots.size.toString();

        ReactNativeScript.render(
            cellFactory(item, ref),
            null,
            () => {
                // console.log(`Rendered into cell! ref:`);
            },
            rootKey
        );
        this.roots.add(rootKey);

        return {
            rootKey,
            ref,
        };
    }

    componentDidMount() {
        super.componentDidMount();

        const node: E | null = this.getCurrentRef();
        if (!node) {
            console.warn(`React ref to NativeScript View lost, so unable to set item templates.`);
            return;
        }

        /* NOTE: does not support updating of this.props.cellFactories upon Props update. */
        if (this.props.cellFactories) {
            const itemTemplates: KeyedTemplate[] = [];
            this.props.cellFactories.forEach((info, key: string) => {
                const {placeholderItem, cellFactory} = info;
                itemTemplates.push({
                    key,
                    createView: () => {
                        console.log(`[Pager] item template "${key}"`);
                        const rootKeyAndRef: RootKeyAndRef = this.renderNewRoot(placeholderItem, cellFactory);
                        this.argsViewToRootKeyAndRef.set(rootKeyAndRef.ref.current, rootKeyAndRef);

                        return rootKeyAndRef.ref.current;
                    },
                });
            });
            node.itemTemplates = itemTemplates;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.roots.forEach(root => ReactNativeScript.unmountComponentAtNode(root));
    }

    public static isItemsSource(arr: any[] | ItemsSource): arr is ItemsSource {
       return typeof (arr as ItemsSource).getItem === 'function';
    }

    render() {
        console.log(`Pager's render()`);
        const {
            forwardedRef,

            onLoaded,
            onUnloaded,
            onAndroidBackPressed,
            onShowingModally,
            onShownModally,

            onTap,
            onDoubleTap,
            onPinch,
            onPan,
            onSwipe,
            onRotation,
            onLongPress,
            onTouch,

            onPropertyChange,

            children,
            _debug,

            items,
            ...rest
        } = this.props;

        return React.createElement(
            'pager',
            {
                className: 'pager-group',
                ...rest,
                items,
                ref: forwardedRef || this.myRef,
            },
            children
        );
    }
}

type OwnPropsWithoutForwardedRef = PropsWithoutForwardedRef<PagerComponentProps<NativeScriptPager>>;

const Pager: React.ComponentType<OwnPropsWithoutForwardedRef & React.ClassAttributes<NativeScriptPager>> = React.forwardRef<NativeScriptPager, OwnPropsWithoutForwardedRef>(
    (props: React.PropsWithChildren<OwnPropsWithoutForwardedRef>, ref: React.RefObject<NativeScriptPager>) => {
        const {children, ...rest} = props;

        return React.createElement(
            _Pager,
            {
                ...rest,
                forwardedRef: ref,
            },
            children
        );
    }
);


elementMap['pager'] = Pager;

export {
    Pager as $Pager
};
