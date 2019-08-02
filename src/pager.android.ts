import { KeyedTemplate, layout, Property, View } from 'tns-core-modules/ui/core/view';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { ChangeType, ObservableArray } from 'tns-core-modules/data/observable-array';
import * as types from 'tns-core-modules/utils/types';
import { screen } from 'tns-core-modules/platform/platform';
import {
    disableSwipeProperty,
    Indicator,
    indicatorProperty,
    ItemEventData,
    ITEMLOADING,
    itemsProperty,
    itemTemplatesProperty,
    LOADMOREITEMS,
    Orientation,
    orientationProperty,
    PagerBase,
    PagerItem,
    peakingProperty,
    selectedIndexProperty,
    showIndicatorProperty,
    spacingProperty,
    Transformer
} from './pager.common';

export * from './pager.common';

function notifyForItemAtIndex(
    owner,
    nativeView: any,
    view: any,
    eventName: string,
    index: number
) {
    let args = {
        eventName: eventName,
        object: owner,
        index: index,
        view: view,
        ios: undefined,
        android: nativeView
    };
    owner.notify(args);
    return args;
}

declare var java, android;
export { Transformer, EventData, ItemsSource } from './pager.common';
const PLACEHOLDER = 'PLACEHOLDER';

export class Pager extends PagerBase {
    nativeViewProtected: any; /* androidx.viewpager2.widget.ViewPager2 */
    _androidViewId: number;
    private _disableAnimation: boolean;
    public pagesCount: number;
    widthMeasureSpec: number;
    heightMeasureSpec: number;
    public perPage: number;

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    private _oldDisableAnimation: boolean = false;
    _pagerAdapter;
    private _views: Array<any>;
    private _pageListener: any;
    _viewMap: Map<string, View>;
    public _realizedItems = new Map<any /*android.view.View*/,
        View>();
    public _realizedTemplates = new Map<string,
        Map<any /*android.view.View*/, View>>();
    lastEvent = 0;
    private _lastSpacing = 0;
    private _lastPeaking = 0;
    private compositeTransformer: any;
    private marginTransformer: any;
    private _transformers: any[];
    private _selectedIndexBeforeLoad = 0;
    private _pager;
    private _indicatorView;

    constructor() {
        super();
        this._childrenViews = new Map<number, View>();
        this._transformers = [];
    }

    get views() {
        return this._views;
    }

    set views(value: Array<any>) {
        this._views = value;
    }

    get android() {
        return this.nativeViewProtected;
    }

    get pager() {
        return this._pager;
    }

    get indicatorView() {
        return this._indicatorView;
    }

    public createNativeView() {
        const that = new WeakRef(this);

        const nativeView = new android.widget.RelativeLayout(this._context);
        this._pager = new androidx.viewpager2.widget.ViewPager2(
            this._context
        );
        this._viewMap = new Map();
        if (this.orientation === 'vertical') {
            this.pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_VERTICAL
            );
        } else {
            this.pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2
                    .ORIENTATION_HORIZONTAL
            );
        }

        initPagerChangeCallback();

        this._pageListener = new PageChangeCallback(that);

        initPagerRecyclerAdapter();
        this._pagerAdapter = new PagerRecyclerAdapter(new WeakRef(this));
        this.compositeTransformer = new androidx.viewpager2.widget.CompositePageTransformer();
        if (this.pagesCount > 0) {
            this.pager.setOffscreenPageLimit(this.pagesCount);
        } else {
            this.pager.setOffscreenPageLimit(3);
        }
        this.pager.setUserInputEnabled(!this.disableSwipe);
        this.on(View.layoutChangedEvent, this.onLayoutChange, this);
        nativeView.addView(this.pager);
        this._indicatorView = new (com as any).rd.PageIndicatorView2(this._context);
        const params = new android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
            android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT
        );

        params.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        params.addRule(android.widget.RelativeLayout.CENTER_HORIZONTAL);
        params.setMargins(0, 0, 0, 10 * screen.mainScreen.scale);
        (this._indicatorView as android.widget.RelativeLayout).setLayoutParams(params);
        this._indicatorView.setViewPager(this.pager);

        if (this.showIndicator) {
            nativeView.addView(this._indicatorView);
        }

        return nativeView;
    }

    public initNativeView() {
        super.initNativeView();
        // Store disable animation value
        this._oldDisableAnimation = this.disableAnimation;
        // Disable animation to set currentItem w/o animation
        this.disableAnimation = true;
        this.pager.registerOnPageChangeCallback(
            this._pageListener
        );
        this.pager.setAdapter(this._pagerAdapter);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        if (this.pagesCount > 0) {
            this.pager.setOffscreenPageLimit(
                this.pagesCount
            );
        }
        this._setIndicator(this.indicator);
        this.nativeView.setId(this._androidViewId);
        this._setPeaking(this.peaking);
        this._setSpacing(this.spacing);
        this._setTransformers(this.transformers ? this.transformers : '');
    }

    onLayoutChange(args: any) {
        this._setSpacing(args.object.spacing);
        this._setPeaking(args.object.peaking);
        this._setTransformers(this.transformers ? this.transformers : '');
        this._updateScrollPosition();
        // Set disableAnimation to original value
        this.disableAnimation = this._oldDisableAnimation;
    }

    private _setSpacing(value: any) {
        const size = this.convertToSize(value);
        const newSpacing = size !== this._lastSpacing;
        if (newSpacing) {
            if (this.marginTransformer) {
                this.compositeTransformer.removeTransformer(
                    this.marginTransformer
                );
            }

            this.marginTransformer = new androidx.viewpager2.widget.MarginPageTransformer(
                size
            );
            this.compositeTransformer.addTransformer(
                this.marginTransformer
            );
            this._lastSpacing = size;
        }
    }

    private _setPeaking(value: any) {
        const size = this.convertToSize(value);
        const newPeaking = size !== this._lastPeaking;
        if (newPeaking) {
            // @ts-ignore
            this.pager.setClipToPadding(false);
            const left =
                this.orientation === 'horizontal' ? size : 0;
            const top =
                this.orientation === 'horizontal' ? 0 : size;
            // @ts-ignore
            this.pager.setPadding(
                left,
                top,
                left,
                top
            );
            // @ts-ignore
            this.pager.setClipChildren(false);
            this._lastPeaking = size;
        }
    }

    [spacingProperty.setNative](value: any) {
        this._setSpacing(value);
    }

    [peakingProperty.setNative](value: any) {
        this._setPeaking(value);
    }

    [indicatorProperty.setNative](value: Indicator) {
        this._setIndicator(value);
    }

    private _setIndicator(value: Indicator) {
        const AnimationType = (com as any).rd.animation.type.AnimationType;
        switch (value) {
            case Indicator.None:
                this.indicatorView.setAnimationType(AnimationType.NONE);
                break;
            case Indicator.Worm:
                this.indicatorView.setAnimationType(AnimationType.WORM);
                break;
            case Indicator.Fill:
                this.indicatorView.setAnimationType(AnimationType.FILL);
                break;
            case Indicator.Swap:
                this.indicatorView.setAnimationType(AnimationType.SWAP);
                break;
            case Indicator.THIN_WORM:
                this.indicatorView.setAnimationType(AnimationType.THIN_WORM);
                break;
            default:

                break;
        }
    }

    private _setTransformers(transformers: string) {
        if (!types.isString(transformers)) {
            return;
        }
        const transformsArray = transformers.split(' ');
        this._transformers.forEach(transformer => {
            this.compositeTransformer.removeTransformer(transformer);
        });
        for (const transformer of transformsArray) {
            if (transformer === Transformer.SCALE) {
                initZoomOutPageTransformer();
                const nativeTransformer = new ZoomOutPageTransformer();
                nativeTransformer.owner = new WeakRef<Pager>(this);
                this._transformers.push(nativeTransformer);
                this.compositeTransformer.addTransformer(nativeTransformer);
            }
        }
        if (transformsArray.length === 0) {
            this._transformers.forEach(transformer => {
                this.compositeTransformer.removeTransformer(transformer);
            });
        }

        this.pager.setPageTransformer(
            this.compositeTransformer
        );
    }

    public disposeNativeView() {
        this.off(View.layoutChangedEvent, this.onLayoutChange, this);
        this._viewMap.clear();
        this._childrenViews.clear();
        this._pageListener = null;
        this._pagerAdapter = null;
        this._transformers = [];
        super.disposeNativeView();
    }

    get disableAnimation(): boolean {
        return this._disableAnimation;
    }

    set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    get pagerAdapter() {
        return this._pagerAdapter;
    }

    get _childrenCount(): number {
        return this.items
            ? this.items.length
            : this._childrenViews
                ? this._childrenViews.size
                : 0;
    }

    [disableSwipeProperty.setNative](value: boolean) {
        if (this.pager) {
            this.pager.setUserInputEnabled(!value);
        }
    }

    [itemsProperty.getDefault](): any {
        return null;
    }

    [itemsProperty.setNative](value: any) {
        if (value && value.length) {
            this.indicatorView.setCount(this._childrenCount);
        }
        if (value) {
            if (value instanceof ObservableArray) {
                const adapter = this.pagerAdapter;
                if (!adapter) return;
                selectedIndexProperty.coerce(this);
                value.on('change', (args) => {
                    this.indicatorView.setCount(this._childrenCount);
                    switch (args.action) {
                        case ChangeType.Add:
                            adapter.notifyItemRangeInserted(args.index, args.addedCount);
                            break;
                        case ChangeType.Delete:
                            adapter.notifyItemRangeRemoved(args.index, args.removed.length);
                            break;
                        case  ChangeType.Splice:
                            if (args.removed.length > 0) {
                                adapter.notifyItemRangeRemoved(args.index, args.removed.length);
                            }
                            if (args.addedCount > 0) {
                                adapter.notifyItemRangeInserted(args.index, args.addedCount);
                            }
                            break;
                        case ChangeType.Update:
                            adapter.notifyItemChanged(args.index);
                            break;
                        default:
                            break;
                    }
                    selectedIndexProperty.coerce(this);
                    this._updateScrollPosition();
                });
            } else {
                this.refresh();
                selectedIndexProperty.coerce(this);
            }
        }
    }

    private _updateScrollPosition() {
        if (this.pager.getCurrentItem() !== this.selectedIndex) {
            this.pager.setCurrentItem(
                this.selectedIndex,
                false
            );
            this._indicatorView.setSelection(this.selectedIndex);
        }
    }

    onLoaded(): void {
        super.onLoaded();
        if (!this.items && this._childrenCount > 0) {
            initStaticPagerStateAdapter();
            this._pagerAdapter = new StaticPagerStateAdapter(new WeakRef(this));
            this.pager.setAdapter(this._pagerAdapter);
            selectedIndexProperty.coerce(this);
            setTimeout(() => {
                this.pager.setCurrentItem(
                    this.selectedIndex,
                    false
                );
            }, 0);
        }
    }

    [selectedIndexProperty.setNative](value: number) {
        if (this.isLoaded && this.isLayoutValid && this.pager) {
            if (this.pager.getCurrentItem() !== value) {
                this.pager.setCurrentItem(
                    value,
                    !this.disableAnimation
                );
            }
        }
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        if (this.pager) {
            this.pager.setCurrentItem(index, animate);
        }
    }

    _onItemsChanged(oldValue: any, newValue: any): void {
    }

    refresh() {
        if (this.pager && this._pagerAdapter) {
            this.pager.requestLayout();
            // @ts-ignore
            this.pager.getAdapter()
                .notifyDataSetChanged();
        }
    }

    updatePagesCount(value: number) {
        if (this.pager) {
            this._pagerAdapter.notifyDataSetChanged();
            this.pager.setOffscreenPageLimit(value);
        }
    }

    onUnloaded() {
        // this._android.setAdapter(null);
        super.onUnloaded();
    }

    eachChildView(callback: (child: View) => boolean): void {
        if (this._viewMap && this._viewMap.size > 0) {
            this._viewMap.forEach((view, key) => {
                callback(view);
            });
        }
    }

    updateAdapter() {
        this._pagerAdapter.notifyDataSetChanged();
    }

    _selectedIndexUpdatedFromNative(newIndex: number) {
    }

    [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    }

    [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(
            this._defaultTemplate
        );
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(
                value
            );
        }

        this._pagerAdapter = new PagerRecyclerAdapter();
        this._pagerAdapter.owner = new WeakRef(this);
        this.pager.setAdapter(this._pagerAdapter);
        this.refresh();
    }

    [showIndicatorProperty.setNative](value: boolean) {
        const hasParent = this.indicatorView.getParent();
        if (value) {
            if (!hasParent) {
                this.nativeView.addView(this.indicatorView);
            }
        } else {
            if (hasParent) {
                this.nativeView.removeView(this.indicatorView);
            }
        }
    }

    _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof PagerItem) {
            if (!value.parent && value.parent !== this) {
                this._childrenViews.set(this._childrenViews.size, value);
            }
        }
    }

    public [orientationProperty.setNative](value: Orientation) {
        if (value === 'vertical') {
            this.nativeViewProtected.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_VERTICAL
            );
        } else {
            this.nativeViewProtected.setOrientation(
                androidx.viewpager2.widget.ViewPager2
                    .ORIENTATION_HORIZONTAL
            );
        }
    }

    _horizontalOffset: number = 0;
    get horizontalOffset(): number {
        return this._horizontalOffset / layout.getDisplayDensity();
    }

    _verticalOffset: number = 0;
    get verticalOffset(): number {
        return this._verticalOffset / layout.getDisplayDensity();
    }
}

export const pagesCountProperty = new Property<Pager, number>({
    name: 'pagesCount',
    defaultValue: 0,
    valueConverter: (v) => parseInt(v),
    valueChanged: (pager: Pager, oldValue, newValue) => {
        pager.updatePagesCount(pager.pagesCount);
    }
});
pagesCountProperty.register(Pager);

let PageChangeCallback;

function initPagerChangeCallback() {
    if (PageChangeCallback) {
        return PageChangeCallback;
    }

    class PageChangeCallbackImpl extends androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback {
        private readonly owner: WeakRef<Pager>;

        constructor(owner: WeakRef<Pager>) {
            super();
            this.owner = owner;
            return global.__native(this);
        }

        onPageSelected(position: number) {
            const owner = this.owner && this.owner.get();
            if (owner) {
                if (owner.isLayoutValid && owner.selectedIndex !== position) {
                    owner.indicatorView.setSelection(position);
                    selectedIndexProperty.nativeValueChange(owner, position);
                }
                owner.notify({
                    eventName: Pager.swipeEvent,
                    object: owner
                });
            }
        }

        onPageScrolled(position, positionOffset, positionOffsetPixels) {
            const offset = position * positionOffsetPixels;
            const owner = this.owner && this.owner.get();
            if (owner) {
                if (owner.orientation === 'vertical') {
                    owner._horizontalOffset = 0;
                    owner._verticalOffset = offset;
                } else if (owner.orientation === 'horizontal') {
                    owner._horizontalOffset = offset;
                    owner._verticalOffset = 0;
                }
                owner.notify({
                    eventName: Pager.scrollEvent,
                    object: owner,
                    selectedIndex: position,
                    scrollX: owner.horizontalOffset,
                    scrollY: owner.verticalOffset
                });
                if (owner.items && position === (owner.items.length - 1) - owner.loadMoreCount) {
                    owner.notify({eventName: LOADMOREITEMS, object: owner});
                }
            }
        }

        onPageScrollStateChanged(state) {
            const owner = this.owner && this.owner.get();
            if (owner) {
                if (owner.lastEvent === 0 && state === 1) {
                    owner.notify({
                        eventName: Pager.swipeStartEvent,
                        object: owner
                    });
                    owner.lastEvent = 1;
                } else if (owner.lastEvent === 1 && state === 1) {
                    owner.notify({
                        eventName: Pager.swipeOverEvent,
                        object: owner
                    });
                    owner.lastEvent = 1;
                } else if (owner.lastEvent === 1 && state === 2) {
                    owner.notify({
                        eventName: Pager.swipeEndEvent,
                        object: owner
                    });
                    owner.lastEvent = 2;
                } else {
                    owner.lastEvent = 0;
                }
            }
        }
    }

    PageChangeCallback = PageChangeCallbackImpl;
}

let PagerRecyclerAdapter;

function initPagerRecyclerAdapter() {
    if (PagerRecyclerAdapter) {
        return;
    }

    class PagerRecyclerAdapterImpl extends androidx.recyclerview.widget.RecyclerView.Adapter<any> {
        owner: WeakRef<Pager>;

        constructor(owner: WeakRef<Pager>) {
            super();
            this.owner = owner;
            return global.__native(this);
        }

        onCreateViewHolder(param0: android.view.ViewGroup, type: number): any {
            const owner = this.owner ? this.owner.get() : null;
            if (!owner) {
                return null;
            }
            const template = owner._itemTemplatesInternal[type];

            let view: View =
                template.createView();
            let sp = new StackLayout();
            if (view) {
                sp.addChild(view);
            } else {
                sp[PLACEHOLDER] = true;
            }
            owner._addView(sp);
            sp.nativeView.setLayoutParams(
                new android.view.ViewGroup.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT
                )
            );

            owner._realizedItems.set(sp.nativeView, sp);

            initPagerViewHolder();

            return new PagerViewHolder(
                new WeakRef(sp),
                new WeakRef(owner)
            );
        }


        onBindViewHolder(holder: any, index: number): void {
            const owner = this.owner ? this.owner.get() : null;
            if (owner) {
                let args = <ItemEventData>{
                    eventName: ITEMLOADING,
                    object: owner,
                    android: holder,
                    ios: undefined,
                    index,
                    view: holder.view[PLACEHOLDER] ? null : holder.view
                };

                owner.notify(args);
                if (holder.view[PLACEHOLDER]) {
                    if (args.view) {
                        holder.view.addChild(args.view);
                    } else {
                        holder.view.addChild(owner._getDefaultItemContent(index));
                    }
                    holder.view[PLACEHOLDER] = false;
                }
                owner._prepareItem(holder.view, index);
            }
        }

        public getItemId(i: number) {
            const owner = this.owner ? this.owner.get() : null;
            let id = i;
            if (owner && owner.items) {
                const item = (owner as any).items.getItem ? (owner as any).items.getItem(i) : owner.items[i];
                if (item) {
                    id = owner.itemIdGenerator(item, i, owner.items);
                }
            }
            return long(id);
        }

        public getItemCount(): number {
            const owner = this.owner ? this.owner.get() : null;
            return owner && owner.items && owner.items.length
                ? owner.items.length
                : 0;
        }

        public getItemViewType(index: number) {
            const owner = this.owner ? this.owner.get() : null;
            if (owner) {
                let template = owner._getItemTemplate(index);
                return owner._itemTemplatesInternal.indexOf(template);
            }
            return 0;
        }

        hasStableIds(): boolean {
            return true;
        }
    }

    PagerRecyclerAdapter = PagerRecyclerAdapterImpl as any;
}


let StaticPagerStateAdapter;

function initStaticPagerStateAdapter() {
    if (StaticPagerStateAdapter) {
        return;
    }

    class StaticPagerStateAdapterImpl extends androidx.recyclerview.widget.RecyclerView.Adapter<any> {
        owner: WeakRef<Pager>;

        constructor(owner: WeakRef<Pager>) {
            super();
            this.owner = owner;
            return global.__native(this);
        }

        onCreateViewHolder(param0: android.view.ViewGroup, type: number): any {
            const owner = this.owner ? this.owner.get() : null;
            if (!owner) {
                return null;
            }

            const view = owner._childrenViews.get(type);
            let sp = new StackLayout(); // Pager2 requires match_parent so add a parent with to fill
            if (view && !view.parent) {
                sp.addChild(view);
            } else {
                sp[PLACEHOLDER] = true;
            }
            owner._addView(sp);

            sp.nativeView.setLayoutParams(
                new android.view.ViewGroup.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT
                )
            );


            initPagerViewHolder();

            return new PagerViewHolder(
                new WeakRef(sp),
                new WeakRef(owner)
            );
        }

        onBindViewHolder(holder: any, index: number): void {
            const owner = this.owner ? this.owner.get() : null;
            if (owner) {

                let args = <ItemEventData>{
                    eventName: ITEMLOADING,
                    object: owner,
                    android: holder,
                    ios: undefined,
                    index,
                    view: holder.view[PLACEHOLDER] ? null : holder.view
                };

                owner.notify(args);
                if (holder.view[PLACEHOLDER]) {
                    if (args.view) {
                        holder.view.addChild(args.view);
                    }
                    holder.view[PLACEHOLDER] = false;
                }
            }
        }

        hasStableIds(): boolean {
            return true;
        }

        public getItem(i: number) {
            const owner = this.owner ? this.owner.get() : null;
            if (owner) {
                if (owner._childrenViews) {
                    return owner._childrenViews.get(i);
                }
            }
            return null;
        }


        public getItemId(i: number) {
            const owner = this.owner ? this.owner.get() : null;
            let id = i;
            if (owner) {
                const item = this.getItem(i);
                if (item) {
                    id = owner.itemIdGenerator(item, i, Array.from(owner._childrenViews));
                }
            }
            return long(id);
        }

        public getItemCount(): number {
            const owner = this.owner ? this.owner.get() : null;
            return owner && owner._childrenViews
                ? owner._childrenViews.size
                : 0;
        }

        public getItemViewType(index: number) {
            return index;
        }

    }

    StaticPagerStateAdapter = StaticPagerStateAdapterImpl as any;
}

let PagerViewHolder;

function initPagerViewHolder() {
    if (PagerViewHolder) {
        return;
    }

    class PagerViewHolderImpl
        extends androidx.recyclerview.widget.RecyclerView.ViewHolder {
        constructor(
            private owner: WeakRef<View>,
            private pager: WeakRef<Pager>
        ) {
            super(owner.get().nativeViewProtected);
            return global.__native(this);
        }


        get view(): View {
            return this.owner ? this.owner.get() : null;
        }
    }

    PagerViewHolder = PagerViewHolderImpl as any;
}

let ZoomOutPageTransformer;

function initZoomOutPageTransformer() {
    if (ZoomOutPageTransformer) {
        return;
    }

    @Interfaces([androidx.viewpager2.widget.ViewPager2.PageTransformer])
    class ZoomOutPageTransformerImpl extends java.lang.Object implements androidx.viewpager2.widget.ViewPager2.PageTransformer {
        owner: WeakRef<Pager>;

        constructor() {
            super();
            return global.__native(this);
        }

        public transformPage(view, position) {
            const MIN_SCALE = 0.85;
            if (position <= 1 || position >= -1) {
                const scale = Math.max(MIN_SCALE, 1 - Math.abs(position));
                view.setScaleX(scale);
                view.setScaleY(scale);
            } else {
                view.setScaleX(1);
                view.setScaleY(1);
            }
        }
    }


    ZoomOutPageTransformer = ZoomOutPageTransformerImpl as any;
}


let ZoomInPageTransformer;

function initZoomInPageTransformer() {
    if (ZoomInPageTransformer) {
        return;
    }

    @Interfaces([androidx.viewpager2.widget.ViewPager2.PageTransformer])
    class ZoomInPageTransformerImpl extends java.lang.Object implements androidx.viewpager2.widget.ViewPager2.PageTransformer {
        owner: WeakRef<Pager>;

        constructor() {
            super();
            return global.__native(this);
        }

        public transformPage(view, position) {
            const scale = position < 0 ? position + 1.0 : Math.abs(1.0 - position);
            view.setScaleX(scale);
            view.setScaleY(scale);
            view.setPivotX(view.getWidth() * 0.5);
            view.setPivotY(view.getHeight() * 0.5);
            view.setAlpha(view < -1.0 || position > 1.0 ? 0.0 : 1.0 - (scale - 1.0));
        }
    }

    ZoomInPageTransformer = ZoomInPageTransformerImpl as any;
}
