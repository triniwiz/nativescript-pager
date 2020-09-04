import { ChangeType, Color, Device, ObservableArray, profile, Property, Screen, StackLayout, View } from "@nativescript/core";
import {  KeyedTemplate } from "@nativescript/core/ui/core/view";
import * as types from "@nativescript/core/utils/types";
import { layout } from "@nativescript/core/utils/utils";
import {
    autoplayDelayProperty,
    autoPlayProperty,
    disableSwipeProperty,
    Indicator,
    indicatorColorProperty,
    indicatorProperty,
    indicatorSelectedColorProperty,
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
} from "./pager.common";

export * from "./pager.common";
export { ItemsSource, Transformer } from "./pager.common";

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
        android: nativeView,
    };
    owner.notify(args);
    return args;
}

declare const com, java;
const PLACEHOLDER = "PLACEHOLDER";

export class Pager extends PagerBase {
    nativeViewProtected: any; /* androidx.viewpager2.widget.ViewPager2 */
    _androidViewId: number;
    private _disableAnimation: boolean;
    public pagesCount: number;
    widthMeasureSpec: number;
    heightMeasureSpec: number;
    public perPage: number;
    private _observableArrayInstance: ObservableArray<any>;

    public itemTemplateUpdated(oldData: any, newData: any): void {}

    private _oldDisableAnimation: boolean = false;
    _pagerAdapter;
    private _views: Array<any>;
    private _pageListener: any;
    public _realizedItems = new Map<any /*android.view.View*/, View>();
    public _realizedTemplates = new Map<
        string,
        Map<any /*android.view.View*/, View>
    >();
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

    @profile()
    public createNativeView() {
        const that = new WeakRef(this);
        const nativeView = new android.widget.RelativeLayout(this._context);
        this._pager = new androidx.viewpager2.widget.ViewPager2(this._context);
        const sdkVersion = parseInt(Device.sdkVersion, 10);
        if (sdkVersion >= 21) {
            this._pager.setNestedScrollingEnabled(true);
        }
        if (this.orientation === "vertical") {
            this._pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_VERTICAL
            );
        } else {
            this._pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_HORIZONTAL
            );
        }

        initPagerChangeCallback();

        this._pageListener = new PageChangeCallback(that);

        initPagerRecyclerAdapter();
        this._pagerAdapter = new PagerRecyclerAdapter(new WeakRef(this));
        this.compositeTransformer = new androidx.viewpager2.widget.CompositePageTransformer();
        this.pager.setUserInputEnabled(!this.disableSwipe);
        this.on(View.layoutChangedEvent, this.onLayoutChange, this);
        nativeView.addView(
            this.pager,
            new android.widget.RelativeLayout.LayoutParams(
                android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
                android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
            )
        );
        this._indicatorView = new (com as any).rd.PageIndicatorView2(
            this._context
        );
        const params = new android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
            android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT
        );

        params.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        params.addRule(android.widget.RelativeLayout.CENTER_HORIZONTAL);
        params.setMargins(0, 0, 0, 10 * Screen.mainScreen.scale);
        this._indicatorView.setLayoutParams(params);

        // this._indicatorView.setViewPager(this.pager);
        this._indicatorView.setDynamicCount(true);
        this._indicatorView.setInteractiveAnimation(true);
        nativeView.addView(this._indicatorView);
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
            this.pager.setOffscreenPageLimit(this.pagesCount);
        } else {
            this.pager.setOffscreenPageLimit(3);
        }

        this._setIndicator(this.indicator);
        // this.nativeView.setId(this._androidViewId);
        this._setPeaking(this.peaking);
        this._setSpacing(this.spacing);
        this._setTransformers(this.transformers ? this.transformers : "");

        if (this.showIndicator) {
            this._indicatorView.setCount(this.items ? this.items.length : 0);
        } else {
            this._indicatorView.setCount(0);
        }
    }

    onLayoutChange(args: any) {
        this._setSpacing(args.object.spacing);
        this._setPeaking(args.object.peaking);
        this._setTransformers(this.transformers ? this.transformers : "");
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
            this.compositeTransformer.addTransformer(this.marginTransformer);
            this._lastSpacing = size;
        }
    }

    private _setPeaking(value: any) {
        const size = this.convertToSize(value);
        const newPeaking = size !== this._lastPeaking;
        if (newPeaking) {
            this.pager.setClipToPadding(false);
            const left = this.orientation === "horizontal" ? size : 0;
            const top = this.orientation === "horizontal" ? 0 : size;
            this.pager.setPadding(left, top, left, top);
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
        const transformsArray = transformers.split(" ");
        this._transformers.forEach((transformer) => {
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
            this._transformers.forEach((transformer) => {
                this.compositeTransformer.removeTransformer(transformer);
            });
        }

        this.pager.setPageTransformer(this.compositeTransformer);
    }

    private _observableArrayHandler = (args) => {
        if (this.indicatorView && this.showIndicator) {
            this.indicatorView.setCount(this._childrenCount);
        }
        if (this.pagerAdapter) {
            switch (args.action) {
                case ChangeType.Add:
                    this.pagerAdapter.notifyItemRangeInserted(
                        args.index,
                        args.addedCount
                    );
                    break;
                case ChangeType.Delete:
                    this.pagerAdapter.notifyItemRangeRemoved(
                        args.index,
                        args.removed.length
                    );
                    break;
                case  ChangeType.Splice:
                    if (args.removed.length > 0) {
                        this.pagerAdapter.notifyItemRangeRemoved(
                            args.index,
                            args.removed.length
                        );
                    }
                    if (args.addedCount > 0) {
                        this.pagerAdapter.notifyItemRangeInserted(
                            args.index,
                            args.addedCount
                        );
                    }
                    break;
                case ChangeType.Update:
                    this.pagerAdapter.notifyItemChanged(args.index);
                    break;
                default:
                    break;
            }
            this._initAutoPlay(this.autoPlay);
        }
    }

    public disposeNativeView() {
        this.off(View.layoutChangedEvent, this.onLayoutChange, this);
        this._childrenViews.clear();
        this._realizedItems.clear();
        this._realizedTemplates.clear();
        this._pageListener = null;
        this._pagerAdapter = null;
        this._transformers = [];
        if (this._observableArrayInstance) {
            this._observableArrayInstance.off(
                ObservableArray.changeEvent,
                this._observableArrayHandler
            );
            this._observableArrayInstance = null;
        }
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

    [indicatorColorProperty.setNative](value: Color | string) {
        if (this.indicatorView) {
            if (value instanceof Color) {
                this.indicatorView.setUnselectedColor(value.android);
            } else if (types.isString(value)) {
                this.indicatorView.setUnselectedColor(new Color(value).android);
            }
        }
    }

    [indicatorSelectedColorProperty.setNative](value: Color | string) {
        if (this.indicatorView) {
            if (value instanceof Color) {
                this.indicatorView.setSelectedColor(value.android);
            } else if (types.isString(value)) {
                this.indicatorView.setSelectedColor(new Color(value).android);
            }
        }
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
        if (value && value.length && this.showIndicator) {
            this.indicatorView.setCount(this._childrenCount);
        }
        if (this._observableArrayInstance) {
            this._observableArrayInstance.off(
                ObservableArray.changeEvent,
                this._observableArrayHandler
            );
            this._observableArrayInstance = null;
        }

        if (value) {
            if (value instanceof ObservableArray) {
                const adapter = this.pagerAdapter;
                if (!adapter) return;
                selectedIndexProperty.coerce(this);
                this._observableArrayInstance = value as any;
                this._observableArrayInstance.on(
                    ObservableArray.changeEvent,
                    this._observableArrayHandler
                );
            } else {
                this.refresh();
                selectedIndexProperty.coerce(this);
            }
        }
    }

    private _updateScrollPosition() {
        const index = this.circularMode
            ? this.selectedIndex + 1
            : this.selectedIndex;
        if (this.pager.getCurrentItem() !== index) {
            this.indicatorView.setInteractiveAnimation(false);
            this.pager.setCurrentItem(index, false);
            this._indicatorView.setSelected(this.selectedIndex);
        }
        setTimeout(() => {
            this._initAutoPlay(this.autoPlay);
        });
    }

    onLoaded(): void {
        super.onLoaded();
        if (!this.items && this._childrenCount > 0) {
            initStaticPagerStateAdapter();
            if (!(this._pagerAdapter instanceof StaticPagerStateAdapter)) {
                this._pagerAdapter = new StaticPagerStateAdapter(new WeakRef(this));
                this.pager.setAdapter(this._pagerAdapter);
                selectedIndexProperty.coerce(this);
                setTimeout(() => {
                    this.pager.setCurrentItem(
                        this.selectedIndex,
                        false
                    );
                    if (this.indicatorView) {
                        this.indicatorView.setSelection(this.selectedIndex);
                    }
                }, 0);
            }
        }
    }

    [selectedIndexProperty.setNative](value: number) {
        if (this.isLoaded && this.isLayoutValid && this.pager) {
            const index = this.circularMode ? value + 1 : value;
            if (this.pager.getCurrentItem() !== index) {
                //   this.indicatorView.setInteractiveAnimation(!this.disableAnimation);
                this.pager.setCurrentItem(index, !this.disableAnimation);
                if (this.indicatorView) {
                    // this.indicatorView.setSelection(value);
                }
            }
        }
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        if (this.pager) {
            this.pager.setCurrentItem(index, animate);
        }
    }

    _onItemsChanged(oldValue: any, newValue: any): void {}

    refresh() {
        if (this.pager && this._pagerAdapter) {
            this.pager.requestLayout();
            this.pager.getAdapter().notifyDataSetChanged();
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
        if (this._realizedItems && this._realizedItems.size > 0) {
            this._realizedItems.forEach((view, key) => {
                callback(view);
            });
        }
    }

    updateAdapter() {
        this._pagerAdapter.notifyDataSetChanged();
    }

    _selectedIndexUpdatedFromNative(newIndex: number) {}

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
        //const hasParent = this.indicatorView.getParent();
        if (!this.indicatorView) {
            return;
        }
        if (value) {
            // if (!hasParent) {
            //     this.nativeView.addView(this.indicatorView);
            // }
            //this._indicatorView.setVisibility(android.view.View.VISIBLE);
            this.indicatorView.setCount(this.items ? this.items.length : 0);
            this.indicatorView.setSelected(this.selectedIndex);
        } else {
            this.indicatorView.setCount(0);
            // this._indicatorView.setVisibility(android.view.View.GONE);
            // if (hasParent) {
            //     this.nativeView.removeView(this.indicatorView);
            // }
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
        if (value === "vertical") {
            this._pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_VERTICAL
            );
        } else {
            this._pager.setOrientation(
                androidx.viewpager2.widget.ViewPager2.ORIENTATION_HORIZONTAL
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

    static getProgress(indicator, position, positionOffset, isRtl) {
        const count = indicator.getCount();
        let selectedPosition = indicator.getSelection();

        if (isRtl) {
            position = count - 1 - position;
        }

        if (position < 0) {
            position = 0;
        } else if (position > count - 1) {
            position = count - 1;
        }

        let isRightOverScrolled = position > selectedPosition;
        let isLeftOverScrolled;

        if (isRtl) {
            isLeftOverScrolled = position - 1 < selectedPosition;
        } else {
            isLeftOverScrolled = position + 1 < selectedPosition;
        }

        if (isRightOverScrolled || isLeftOverScrolled) {
            selectedPosition = position;
            indicator.setSelection(selectedPosition);
        }

        let slideToRightSide = selectedPosition == position && positionOffset != 0;
        let selectingPosition;
        let selectingProgress;

        if (slideToRightSide) {
            selectingPosition = isRtl ? position - 1 : position + 1;
            selectingProgress = positionOffset;
        } else {
            selectingPosition = position;
            selectingProgress = 1 - positionOffset;
        }

        if (selectingProgress > 1) {
            selectingProgress = 1;
        } else if (selectingProgress < 0) {
            selectingProgress = 0;
        }

        return [selectingPosition, selectingProgress];
    }

    [autoPlayProperty.setNative](value: boolean) {
        this._initAutoPlay(value);
    }

    private _autoPlayInterval: any;

    [autoplayDelayProperty.setNative](value: number) {
        if (this._autoPlayInterval) {
            clearInterval(this._autoPlayInterval);
            this._autoPlayInterval = undefined;
            this._initAutoPlay(this.autoPlay);
        }
    }

    _nextIndex(): number {
        let next = this.selectedIndex + 1;
        if (next > this.lastIndex) {
            return 0;
        }
        return next;
    }

    _initAutoPlay(value: boolean) {
        if (!this.items || this.items.length === 0) {
            return;
        }
        if (!value) {
            if (this._autoPlayInterval) {
                clearInterval(this._autoPlayInterval);
                this._autoPlayInterval = undefined;
            }
        } else {
            if (this.isLayoutValid && !this._autoPlayInterval) {
                this._autoPlayInterval = setInterval(() => {
                    this.selectedIndex = this._nextIndex();
                }, this.autoPlayDelay);
            }
        }
    }

    get itemCount(): number {
        return this._childrenCount
            ? this._childrenCount + (this.circularMode ? 2 : 0)
            : 0;
    }

    get lastIndex(): number {
        if (this.items && this.items.length === 0) {
            return 0;
        }
        return this.circularMode ? this.itemCount - 3 : this.itemCount - 1;
    }
}

export const pagesCountProperty = new Property<Pager, number>({
    name: "pagesCount",
    defaultValue: 0,
    valueConverter: (v) => parseInt(v),
    valueChanged: (pager: Pager, oldValue, newValue) => {
        pager.updatePagesCount(pager.pagesCount);
    },
});
pagesCountProperty.register(Pager);

let PageChangeCallback;

function initPagerChangeCallback() {
    if (PageChangeCallback) {
        return PageChangeCallback;
    }

    @NativeClass
    class PageChangeCallbackImpl extends androidx.viewpager2.widget.ViewPager2
        .OnPageChangeCallback {
        private readonly owner: WeakRef<Pager>;

        constructor(owner: WeakRef<Pager>) {
            super();
            this.owner = owner;
            return global.__native(this);
        }

        onPageSelected(position: number) {
            const owner = this.owner && this.owner.get();
            if (owner) {
                owner.notify({
                    eventName: Pager.swipeEvent,
                    object: owner,
                });
            }
        }

        onPageScrolled(position, positionOffset, positionOffsetPixels) {
            const owner = this.owner && this.owner.get();
            if (owner && owner.isLayoutValid) {
                if (owner.circularMode) {
                    position = owner.pagerAdapter.getPosition(position);
                }
                const offset = position * positionOffsetPixels;
                if (owner.orientation === "vertical") {
                    owner._horizontalOffset = 0;
                    owner._verticalOffset = offset;
                } else if (owner.orientation === "horizontal") {
                    owner._horizontalOffset = offset;
                    owner._verticalOffset = 0;
                }
                owner.notify({
                    eventName: Pager.scrollEvent,
                    object: owner,
                    selectedIndex: position,
                    scrollX: owner.horizontalOffset,
                    scrollY: owner.verticalOffset,
                });
                if (
                    owner.items &&
                    position ===
                        owner.pagerAdapter.lastIndex() - owner.loadMoreCount
                ) {
                    owner.notify({eventName: LOADMOREITEMS, object: owner});
                }

                if (owner.showIndicator && owner.indicatorView) {
                    const progress = Pager.getProgress(
                        owner.indicatorView,
                        position,
                        positionOffset,
                        false
                    );
                    const selectingPosition = progress[0];
                    const selectingProgress = progress[1];
                    owner.indicatorView.setInteractiveAnimation(true);
                    owner.indicatorView.setProgress(
                        selectingPosition,
                        selectingProgress
                    );
                }
            }
        }

        onPageScrollStateChanged(state) {
            const owner = this.owner && this.owner.get();
            if (owner) {
                if (owner.lastEvent === 0 && state === 1) {
                    owner.notify({
                        eventName: Pager.swipeStartEvent,
                        object: owner,
                    });
                    owner.lastEvent = 1;
                } else if (owner.lastEvent === 1 && state === 1) {
                    owner.notify({
                        eventName: Pager.swipeOverEvent,
                        object: owner,
                    });
                    owner.lastEvent = 1;
                } else if (owner.lastEvent === 1 && state === 2) {
                    owner.notify({
                        eventName: Pager.swipeEndEvent,
                        object: owner,
                    });
                    owner.lastEvent = 2;
                } else {
                    owner.lastEvent = 0;
                }
                if (
                    owner.isLayoutValid &&
                    state ===
                        androidx.viewpager2.widget.ViewPager2.SCROLL_STATE_IDLE
                ) {
                    // ts-ignore
                    let count = owner.pagerAdapter.getItemCount();
                    let index = owner.pager.getCurrentItem();
                    if (owner.circularMode) {
                        if (index === 0) {
                            // last item
                            owner.indicatorView.setInteractiveAnimation(false);
                            owner.pager.setCurrentItem(count - 2, false);
                            selectedIndexProperty.nativeValueChange(
                                owner,
                                count - 3
                            );
                            owner.indicatorView.setSelected(count - 3);
                            owner.indicatorView.setInteractiveAnimation(true);
                        } else if (index === count - 1) {
                            // first item
                            owner.indicatorView.setInteractiveAnimation(false);
                            owner.indicatorView.setSelected(0);
                            owner.pager.setCurrentItem(1, false);
                            selectedIndexProperty.nativeValueChange(owner, 0);
                            owner.indicatorView.setInteractiveAnimation(true);
                        } else {
                            selectedIndexProperty.nativeValueChange(
                                owner,
                                index - 1
                            );
                        }
                    } else {
                        selectedIndexProperty.nativeValueChange(owner, index);
                        owner.indicatorView.setSelected(index);
                    }
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

    @NativeClass
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
            
            if (!view && owner._itemViewLoader !== undefined) {
                view = owner._itemViewLoader(template.key);
            }
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

        getPosition(index: number): number {
            const owner = this.owner && this.owner.get();
            let position = index;
            if (owner && owner.circularMode) {
                if (position === 0) {
                    position = this.lastDummy();
                } else if (position === this.firstDummy()) {
                    position = 0;
                } else {
                    position = position - 1;
                }
            }
            return position;
        }

        onBindViewHolder(holder: any, index: number): void {
            const owner = this.owner ? this.owner.get() : null;
            if (owner) {
                if (owner.circularMode) {
                    if (index === 0) {
                        index = this.lastDummy();
                    } else if (index === this.firstDummy()) {
                        index = 0;
                    } else {
                        index = index - 1;
                    }
                }
                const bindingContext = owner._getDataItem(index);
                let args = <ItemEventData>{
                    eventName: ITEMLOADING,
                    object: owner,
                    android: holder,
                    ios: undefined,
                    index,
                    bindingContext,
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
                ? owner.items.length + (owner.circularMode ? 2 : 0)
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

        lastIndex(): number {
            const owner = this.owner && this.owner.get();
            if (owner) {
                if (owner.items.length === 0) {
                    return 0;
                }
                return owner.circularMode ? this.getItemCount() - 3 : this.getItemCount() - 1;
            }
            return 0;
        }

        firstDummy() {
            const count = this.getItemCount();
            if (count === 0) {
                return 0;
            }
            return this.getItemCount() - 1;
        }

        lastDummy() {
            return this.lastIndex();
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

    @NativeClass
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

    @NativeClass
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

    @NativeClass
    @Interfaces([androidx.viewpager2.widget.ViewPager2.PageTransformer])
    class ZoomOutPageTransformerImpl extends java.lang.Object
        implements androidx.viewpager2.widget.ViewPager2.PageTransformer {
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

    @NativeClass
    @Interfaces([androidx.viewpager2.widget.ViewPager2.PageTransformer])
    class ZoomInPageTransformerImpl extends java.lang.Object
        implements androidx.viewpager2.widget.ViewPager2.PageTransformer {
        owner: WeakRef<Pager>;

        constructor() {
            super();
            return global.__native(this);
        }

        public transformPage(view, position) {
            const scale =
                position < 0 ? position + 1.0 : Math.abs(1.0 - position);
            view.setScaleX(scale);
            view.setScaleY(scale);
            view.setPivotX(view.getWidth() * 0.5);
            view.setPivotY(view.getHeight() * 0.5);
            view.setAlpha(
                view < -1.0 || position > 1.0 ? 0.0 : 1.0 - (scale - 1.0)
            );
        }
    }

    ZoomInPageTransformer = ZoomInPageTransformerImpl as any;
}
