import { EventData, KeyedTemplate, View } from '@nativescript/core';
import { layout } from "@nativescript/core/utils/utils";
import { StackLayout } from '@nativescript/core';
import { ProxyViewContainer } from '@nativescript/core';
import * as common from './pager.common';
import {
    autoplayDelayProperty,
    autoPlayProperty,
    disableSwipeProperty,
    Indicator,
    indicatorProperty,
    ITEMDISPOSING,
    ItemEventData,
    ITEMLOADING,
    itemsProperty,
    itemTemplatesProperty,
    LOADMOREITEMS,
    Orientation,
    orientationProperty,
    PagerBase,
    selectedIndexProperty,
    showIndicatorProperty,
    Transformer
} from './pager.common';
import { profile } from '@nativescript/core/profiling';
import { ChangeType, ObservableArray } from '@nativescript/core';

export { Transformer, ItemsSource } from './pager.common';

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
        ios: nativeView,
        android: undefined
    };
    owner.notify(args);
    return args;
}

declare var CHIPageControlAji, CHIPageControlAleppo, CHIPageControlChimayo, CHIPageControlFresno,
    CHIPageControlJalapeno, CHIPageControlJaloro, CHIPageControlPuya, FancyPager, FancyPagerDelegate;

export * from './pager.common';
const main_queue = dispatch_get_current_queue();

export class Pager extends PagerBase {
    lastEvent: number = 0;
    private _disableSwipe: boolean = false;
    private _disableAnimation: boolean = false;
    _layout: any;  /*UICollectionViewFlowLinearLayoutImpl*/
    _preparingCell: boolean = false;
    _delegate: any; /*UICollectionDelegateImpl*/
    private _dataSource;
    _map: Map<PagerCell, View>;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;
    _isDirty: boolean = false;
    _isRefreshing: boolean = false;
    private _pager: any; /*UICollectionView*/
    private _indicatorView: any;
    private _observableArrayInstance: ObservableArray<any>;
    _isInit: boolean = false;

    constructor() {
        super();
        this._map = new Map<PagerCell, View>();
        this._childrenViews = new Map<number, View>();
    }

    get pager() {
        return this._pager;
    }

    get indicatorView() {
        return this._indicatorView;
    }

    createNativeView() {
        const nativeView = UIView.new();
        this._layout = UICollectionViewFlowLinearLayoutImpl.initWithOwner(
            new WeakRef(this)
        );
        this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
        this._layout.minimumInteritemSpacing = 0;
        this._pager = UICollectionView.alloc().initWithFrameCollectionViewLayout(CGRectZero,
            this._layout);
        this.pager.showsHorizontalScrollIndicator = false;
        this.pager.showsVerticalScrollIndicator = false;
        this.pager.decelerationRate = UIScrollViewDecelerationRateFast;
        nativeView.addSubview(this.pager);
        return nativeView;
    }

    initNativeView() {
        super.initNativeView();
        const nativeView = this.pager;
        nativeView.registerClassForCellWithReuseIdentifier(
            PagerCell.class(),
            this._defaultTemplate.key
        );
        nativeView.backgroundColor = UIColor.clearColor;
        nativeView.autoresizesSubviews = false;
        nativeView.autoresizingMask = UIViewAutoresizing.None;
        nativeView.dataSource = this._dataSource = UICollectionViewDataSourceImpl.initWithOwner(
            new WeakRef(this)
        );
        nativeView.scrollEnabled = !(String(this.disableSwipe) === 'true');
        if (this.orientation === 'vertical') {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Vertical;
            nativeView.alwaysBounceVertical = true;
            nativeView.alwaysBounceHorizontal = false;
        } else {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
            nativeView.alwaysBounceHorizontal = true;
            nativeView.alwaysBounceVertical = false;
        }
        this._setIndicator(this.indicator);
        this._delegate = UICollectionDelegateImpl.initWithOwner(new WeakRef(this));
        this._setNativeClipToBounds();
        this._initAutoPlay(this.autoPlay);
    }


    _nextIndex(): number {
        if (this.circularMode) {
            // TODO
            return 0;
        } else {
            let next = this.selectedIndex + 1;
            if (next > this.lastIndex) {
                return 0;
            }
            return next;
        }
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

    getPosition(index: number): number {
        let position = index;
        if (this.circularMode) {
            if (position === 0) {
                position = this.lastDummy;
            } else if (position === this.firstDummy) {
                position = 0;
            } else {
                position = position - 1;
            }
        }
        return position;
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

    get firstDummy(): number {
        const count = this.itemCount;
        if (count === 0) {
            return 0;
        }
        return this.itemCount - 1;
    }

    get lastDummy(): number {
        return this.lastIndex;
    }

    get ios(): any /*UIView*/ {
        return this.nativeView;
    }

    private _setIndicator(value: Indicator) {
        if (this._indicatorView) {
            this._indicatorView.removeFromSuperview();
        }
        switch (value) {
            case Indicator.None:
                this._indicatorView = CHIPageControlAji.new();
                break;
            case Indicator.Worm:
                this._indicatorView = CHIPageControlAleppo.new();
                break;
            case Indicator.Fill:
                this._indicatorView = CHIPageControlChimayo.new();
                break;
            case Indicator.Swap:
                this._indicatorView = CHIPageControlPuya.new();
                break;
            case Indicator.THIN_WORM:
                this._indicatorView = CHIPageControlJalapeno.new();
                break;
            case Indicator.Flat:
                this._indicatorView = CHIPageControlJaloro.new();
                break;
            default:

                break;
        }
        this._indicatorView.tintColor = UIColor.whiteColor;
        this._indicatorView.currentPageTintColor = UIColor.whiteColor;
    }

    public get _childrenCount() {
        return this.items ? this.items.length : this._childrenViews ? this._childrenViews.size : 0;
    }

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    public _setNativeClipToBounds(): void {
        this.pager.clipsToBounds = true;
    }

    public [orientationProperty.setNative](value: Orientation) {
        if (value === 'horizontal') {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
        } else {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Vertical;
        }
    }

    public eachChildView(callback: (child: View) => boolean): void {
        this._map.forEach((view, key) => {
            callback(view);
        });
    }

    _updateScrollPosition() {
        const view = (this.pager as UICollectionView);
        const size = this.orientation === 'vertical' ? view.contentSize.height : view.contentSize.width;
        if (!view || size === 0) {
            return;
        }
        this._scrollToIndexAnimated(this.selectedIndex, false);
    }

    [selectedIndexProperty.setNative](value: number) {
        if (this.isLoaded) {
            this.scrollToIndexAnimated(value, true);
        }
    }

    [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    }

    [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(
            this._defaultTemplate
        );
        if (value) {
            for (let i = 0, length = value.length; i < length; i++) {
                this.pager.registerClassForCellWithReuseIdentifier(
                    PagerCell.class(),
                    value[i].key
                );
            }
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }

    }

    [itemsProperty.setNative](value: any) {
        if (this.indicatorView && value && value.length) {
            this.indicatorView.numberOfPages = value.length;
        }
        // remove old instance
        if (this._observableArrayInstance) {
            this._observableArrayInstance.off(ObservableArray.changeEvent, this._observableArrayHandler);
            this._observableArrayInstance = null;
        }
        if (value instanceof ObservableArray) {
            this._observableArrayInstance = value as any;
            this._observableArrayInstance.on(ObservableArray.changeEvent, this._observableArrayHandler);
        } else {
            this.refresh();
        }

        if (!value) {
            this._isInit = false;
        }
        selectedIndexProperty.coerce(this);
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

    [showIndicatorProperty.setNative](value: boolean) {
        if (!this.indicatorView) {
            this._setIndicator(this.indicatorView);
        }
        if (!this.nativeView) {
            return;
        }
        this.indicatorView.center = CGPointMake(this.nativeView.center.x, this.nativeView.bounds.size.height - this.indicatorView.intrinsicContentSize.height);
        const hasParent = this.indicatorView.superview;
        if (value) {
            if (!hasParent) {
                this.nativeView.addSubview(this.indicatorView);
            }
        } else {
            if (hasParent) {
                this.indicatorView.removeFromSuperview();
            }
        }
    }

    private _observableArrayHandler = (args) => {
        if (!this.pager) {
            return;
        }
        if (this.indicatorView && this._observableArrayInstance && this._observableArrayInstance.length) {
            this.indicatorView.numberOfPages = this._observableArrayInstance.length;
        }

        const collectionView = this.pager as UICollectionView;
        if (collectionView) {
          try {
            let offset = 0;
            collectionView.performBatchUpdatesCompletion(() => {
                this._isRefreshing = true;
                const array = [];
                switch (args.action) {
                    case ChangeType.Add:
                        for (let i = 0; i < args.addedCount; i++) {
                            array.push(NSIndexPath.indexPathForRowInSection(args.index + i, 0));
                        }
                        offset = collectionView.contentSize.width - collectionView.contentOffset.x;
                        collectionView.insertItemsAtIndexPaths(array);
                        break;
                    case ChangeType.Delete:
                        for (let i = 0; i < args.removed.length; i++) {
                            array.push(NSIndexPath.indexPathForItemInSection(args.index + i, 0));
                        }
                        collectionView.deleteItemsAtIndexPaths(array);
                        break;
                    case  ChangeType.Splice:
                        if (args.removed && args.removed.length > 0) {
                            for (let i = 0; i < args.removed.length; i++) {
                                array.push(NSIndexPath.indexPathForRowInSection(args.index + i, 0));
                            }
                            collectionView.deleteItemsAtIndexPaths(array);
                        } else {
                            const addedArray = [];
                            for (let i = 0; i < args.addedCount; i++) {
                                addedArray.push(NSIndexPath.indexPathForRowInSection(args.index + i, 0));
                            }
                            collectionView.insertItemsAtIndexPaths(addedArray);
                        }
                        break;
                    case ChangeType.Update:
                        collectionView.reloadItemsAtIndexPaths([NSIndexPath.indexPathForRowInSection(args.index, 0)]);
                        break;
                    default:
                        break;
                }
                this._initAutoPlay(this.autoPlay);
                if (this.itemCount === 0) {
                    this._isInit = false;
                }
            }, null);
          } catch (err) {

          }
        }
    };

    _onItemsChanged(oldValue: any, newValue: any): void {
    }

    _scrollToIndexAnimated(index: number, animate: boolean) {
        if (!this.pager) return;
        const contentSize = this.pager.contentSize;
        const size = this.orientation === 'vertical' ? contentSize.height : contentSize.width;
        if (size === 0) {
            return;
        }
        if (this._childrenCount === 0) {
            return;
        }
        let maxMinIndex = -1;
        const max = this._childrenCount - 1;
        if (index < 0) {
            maxMinIndex = 0;
        } else if (index > max) {
            maxMinIndex = max;
        } else {
            maxMinIndex = index;
        }

        if (maxMinIndex === -1) {
            maxMinIndex = 0;
        }

        dispatch_async(main_queue, () => {
            this.pager.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(maxMinIndex, 0), this.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, !!animate);
            selectedIndexProperty.nativeValueChange(this, maxMinIndex);
        });
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        this._scrollToIndexAnimated(index, animate);
    }

    private _reset() {
        if (!this.pager) {
            return;
        }
        this.pager.reloadData();
        this.pager.collectionViewLayout.invalidateLayout();
        this._updateScrollPosition();
    }

    private _refresh() {
        if (!this.pager) {
            return;
        }
        if (this.items instanceof ObservableArray) {
            this.pager.performBatchUpdatesCompletion(() => {
                this._reset();
            }, null);
        } else {
            this._reset();
        }
    }

    refresh() {
        dispatch_async(main_queue, () => {
            this._refresh();
        });
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        if (this.showIndicator && this.indicatorView) {
            this.nativeView.addSubview(this.indicatorView);
        }
        if (!this._isDirty) {
            this.refresh();
            this._isDirty = true;
        }

        this.pager.delegate = this._delegate;

        if (!this.items && this._childrenCount > 0) {
            selectedIndexProperty.coerce(this);
            this._updateScrollPosition();
        }
    }

    public onUnloaded() {
        if (this.pager) {
            this.pager.delegate = null;
        }
        super.onUnloaded();
    }

    public disposeNativeView() {
        this._delegate = null;
        this._dataSource = null;
        this._layout = null;
        if (this._observableArrayInstance) {
            this._observableArrayInstance.off(ObservableArray.changeEvent, this._observableArrayHandler);
            this._observableArrayInstance = null;
        }
        super.disposeNativeView();
    }

    [indicatorProperty.setNative](value: Indicator) {
        this._setIndicator(value);
    }

    [disableSwipeProperty.setNative](value: boolean) {
        if (this.pager) {
            this.pager.scrollEnabled = !(String(value) === 'true');
        }
        this._disableSwipe = String(value) === 'true';
    }

    get disableAnimation(): boolean {
        return this._disableAnimation;
    }

    set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    public _removeContainer(cell: PagerCell,
                            indexPath?: NSIndexPath): void {
        let view = cell.view;

        let args = <ItemEventData>{
            eventName: ITEMDISPOSING,
            object: this,
            index: indexPath.row,
            android: undefined,
            ios: cell,
            view: view
        };
        this.notify(args);
        view = args.view;
        if (view && view.parent) {
            // This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
            if (!(view.parent instanceof Pager)) {
                this._removeView(view.parent);
            }

            view.parent._removeView(view);
        }
        this._map.delete(cell);
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const changed = (this as any)._setCurrentMeasureSpecs(
            widthMeasureSpec,
            heightMeasureSpec
        );
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            dispatch_async(main_queue, () => {
                if (!this.pager) {
                    return;
                }
                this.pager.reloadData();
                this._updateScrollPosition();
                this._initAutoPlay(this.autoPlay);
            });
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this._map.forEach((childView: any, pagerCell) => {
            View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
        });
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        super.onLayout(left, top, right, bottom);
        this.pager.frame = this.nativeView.bounds;
        if (this.indicatorView && this.indicatorView.intrinsicContentSize) {
            this.indicatorView.center = CGPointMake(this.nativeView.center.x, this.nativeView.bounds.size.height - this.indicatorView.intrinsicContentSize.height);
        }
        const size = this._getSize();
        this._map.forEach((childView, pagerCell) => {
            const width = layout.toDevicePixels(size.width);
            const height = layout.toDevicePixels(size.height);
            View.layoutChild(this, childView, 0, 0, width, height);
        });
    }

    public requestLayout(): void {
        // When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
        if (!this._preparingCell) {
            super.requestLayout();
        }
    }

    public _prepareCell(cell: PagerCell, indexPath: NSIndexPath) {
        try {
            this._preparingCell = true;

            let view = cell.view;
            const template = this._getItemTemplate(indexPath.row);

            if (!view) {
                view = template.createView();
            }

            let args = <ItemEventData>{
                eventName: ITEMLOADING,
                object: this,
                index: indexPath.row,
                android: undefined,
                ios: cell,
                view: view
            };

            this.notify(args);

            view = args.view || this._getDefaultItemContent(indexPath.row);

            // Proxy containers should not get treated as layouts.
            // Wrap them in a real layout as well.
            if (view instanceof ProxyViewContainer) {
                let sp = new StackLayout();
                sp.addChild(view);
                view = sp;
            }

            // If cell is reused it have old content - remove it first.
            if (!cell.view) {
                cell.owner = new WeakRef(view);
            } else if (cell.view !== view) {
                this._map.delete(cell);
                this._removeContainer(cell, indexPath);
                (cell.view.ios as UIView).removeFromSuperview();
                cell.owner = new WeakRef(view);
            }

            this._prepareItem(view, indexPath.row);
            this._map.set(cell, view);

            if (view && !view.parent) {
                this._addView(view);
                cell.contentView.addSubview(view.ios);
            }

            this._layoutCell(view, indexPath);
        } finally {
            this._preparingCell = false;
        }
    }

    _layoutCell(cellView: View, index: NSIndexPath) {
        if (cellView) {
            const size = this._getSize();
            let width = layout.toDevicePixels(size.width);
            let height = layout.toDevicePixels(size.height);
            const widthMeasureSpec = layout.makeMeasureSpec(width, layout.EXACTLY);

            const heightMeasureSpec = layout.makeMeasureSpec(height, layout.EXACTLY);

            const measured = View.measureChild(
                this,
                cellView,
                widthMeasureSpec,
                heightMeasureSpec
            );
        }
    }

    _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof common.PagerItem) {
            if (!this._childrenViews) {
                this._childrenViews = new Map<number, View>();
            }
            const count = this._childrenViews.size;
            const keys = Array.from(this._childrenViews.keys());

            if (count === 0) {
                this._childrenViews.set(this._childrenCount, value);
            } else {
                for (let i = 0; i < count; i++) {
                    const key = keys[i];
                    const view = this._childrenViews.get(key);
                    if (i === keys.length - 1 && value !== view) {
                        this._childrenViews.set(this._childrenCount, value);
                    }
                }
            }

        }
    }

    get horizontalOffset(): number {
        return this.pager ? this.pager.contentOffset.x : 0;
    }

    get verticalOffset(): number {
        return this.pager ? this.pager.contentOffset.y : 0;
    }

    _getSpacing(): number {
        return layout.toDeviceIndependentPixels(this.convertToSize(this.spacing));
    }

    _getPeaking(): number {
        return layout.toDeviceIndependentPixels(this.convertToSize(this.peaking));
    }

    _getSize(w: number = 0, h: number = 0): { width: number, height: number } {
        let width = 0;
        let height = 0;
        if (width === 0) {
            width = layout.toDeviceIndependentPixels(this._effectiveItemWidth);
        }
        if (height === 0) {
            height = layout.toDeviceIndependentPixels(this._effectiveItemHeight);
        }
        if (this.orientation === 'vertical') {
            height = (height - ((this._getSpacing() * 2) + (this._getPeaking() * 2))) / this.perPage;
        } else {
            width = (width - ((this._getSpacing() * 2) + (this._getPeaking() * 2))) / this.perPage;
        }
        if (Number.isNaN(width)) {
            width = 0;
        }

        if (Number.isNaN(height)) {
            height = 0;
        }
        return {width, height};
    }
}

@NativeClass
class PagerCell extends UICollectionViewCell {
    public owner: WeakRef<View>;
    public index: NSIndexPath;

    public get view(): View {
        return this.owner ? this.owner.get() : null;
    }

    public static initWithEmptyBackground(): PagerCell {
        const cell = <PagerCell>PagerCell.new();
        // Clear background by default - this will make cells transparent
        cell.backgroundColor = null;
        return cell;
    }

    public willMoveToSuperview(newSuperview: UIView): void {
        let parent = <Pager>(this.view ? this.view.parent : null);

        // When inside Pager and there is no newSuperview this cell is
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeContainer(this, this.index);
        }
    }
}

@NativeClass
@ObjCClass(UICollectionViewDelegate, UICollectionViewDelegateFlowLayout)
class UICollectionDelegateImpl extends NSObject
    implements UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    private _owner: WeakRef<Pager>;
    private _startingScrollingOffset;
    private _indexOfCellBeforeDragging = 0;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionDelegateImpl {
        const delegate = UICollectionDelegateImpl.alloc().init() as UICollectionDelegateImpl;
        delegate._owner = owner;
        delegate._startingScrollingOffset = CGPointMake(0, 0);
        return delegate;
    }


    public collectionViewLayoutInsetForSectionAtIndex(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): UIEdgeInsets {
        let owner = this._owner ? this._owner.get() : null;
        if (owner) {
            const inset = owner._getSpacing() + owner._getPeaking();
            if (owner.orientation === 'vertical') {
                return new UIEdgeInsets({bottom: inset, left: 0, right: 0, top: inset});
            }

            return new UIEdgeInsets({bottom: 0, left: inset, right: inset, top: 0});
        }
        return new UIEdgeInsets({bottom: 0, left: 0, right: 0, top: 0});
    }

    public collectionViewLayoutSizeForItemAtIndexPath(collectionView: UICollectionView,
                                                      collectionViewLayout: UICollectionViewLayout,
                                                      indexPath: NSIndexPath): CGSize {
        let owner = this._owner && this._owner.get();
        if (!owner) return CGSizeZero;
        const size = owner._getSize();
        return CGSizeMake(size.width, size.height);
    }

    public collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView,
                                                           cell: UICollectionViewCell,
                                                           indexPath: NSIndexPath) {
        const owner = this._owner && this._owner.get();
        if (owner) {
            if (!owner._isInit) {
                owner._updateScrollPosition();
                owner._isInit = true;
            }
            if (owner.items && indexPath.row === owner.lastIndex - owner.loadMoreCount) {
                owner.notify<EventData>({
                    eventName: LOADMOREITEMS,
                    object: owner
                });
            }
        }

        if (cell.preservesSuperviewLayoutMargins) {
            cell.preservesSuperviewLayoutMargins = false;
        }

        if (cell.layoutMargins) {
            cell.layoutMargins = UIEdgeInsetsZero;
        }
    }

    public collectionViewLayoutMinimumLineSpacingForSectionAtIndex(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): number {
        let owner = this._owner ? this._owner.get() : null;
        if (!owner) return 0;
        return owner._getSpacing();
    }

    public scrollViewWillBeginDragging(scrollView: UIScrollView): void {
        this._startingScrollingOffset = scrollView.contentOffset;
        let owner = this._owner && this._owner.get();
        if (owner) {
            if (owner.lastEvent === 0) {
                owner.notify({
                    eventName: Pager.swipeStartEvent,
                    object: owner
                });
                owner.lastEvent = 1;
            }
        }
    }

    public scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void {
        let owner = this._owner ? this._owner.get() : null;
        if (owner) {
            owner.notify({
                eventName: Pager.swipeEvent,
                object: owner
            });
        }
    }

    public scrollViewDidScroll(scrollView: UIScrollView): void {
        let owner = this._owner.get();
        if (owner) {
            let width: number;
            let offset: number;
            let size = this._getRealWidthHeight();
            let total: number;
            let percent: number;
            if (owner.orientation === 'vertical') {
                width = size.height;
                offset = scrollView.contentOffset.y;
                total = scrollView.contentSize.height - scrollView.bounds.size.height;
            } else {
                width = size.width;
                offset = scrollView.contentOffset.x;
                total = scrollView.contentSize.width - scrollView.bounds.size.width;
            }
            percent = (offset / total);
            let progress = percent * (owner.itemCount - 1);
            if (owner.indicatorView && owner.indicatorView.setWithProgressAnimated && !Number.isNaN(progress)) {
                owner.indicatorView.progress = progress;
            }
            const index = parseInt(progress.toFixed(0), 10);
            if (owner.selectedIndex !== index && !Number.isNaN(index)) {
                //  selectedIndexProperty.nativeValueChange(owner, index);
            }
            owner.notify({
                object: owner,
                eventName: Pager.scrollEvent,
                scrollX: owner.horizontalOffset,
                scrollY: owner.verticalOffset
            });

            if (owner.lastEvent === 1) {
                owner.notify({
                    eventName: Pager.swipeOverEvent,
                    object: owner
                });
                owner.lastEvent = 1;
            }


            // (scrollView as any).scrollToItemAtIndexPathAtScrollPositionAnimated(
            //     NSIndexPath.indexPathForRowInSection(Math.round(width),0), UICollectionViewScrollPosition.CenteredHorizontally, true
            // );

            // if(owner.circularMode){
            //     if(nextIndex === 0){
            //         selectedIndexProperty.nativeValueChange(owner, owner._childrenCount - 3);
            //     }else if(nextIndex === owner._childrenCount -1){
            //         selectedIndexProperty.nativeValueChange(owner, 0);
            //     }else {
            //         selectedIndexProperty.nativeValueChange(owner, nextIndex - 1);
            //     }
            // }else {
            //     selectedIndexProperty.nativeValueChange(owner, nextIndex);
            // }

            /* if (!Number.isNaN(width)) {
                 let page = Math.ceil(width);
                 const doScroll = () => {
                     if (!Number.isNaN(width)) {
                         // scrollView.setContentOffsetAnimated(point, false);
                         scrollView.contentOffset = CGPointMake(Math.ceil(w) * page, scrollView.contentOffset.y);
                     }
                 };
                 console.log('page', page, owner.itemCount, page === owner.itemCount);
                 if (page === 0) {
                     page = owner.itemCount - 2;
                     doScroll();
                     // selectedIndexProperty.nativeValueChange(owner, owner.itemCount - 3);
                 } else if (page === owner.itemCount) {
                     page = 1;
                     doScroll();
                     //  selectedIndexProperty.nativeValueChange(owner, 0);
                 } else {
                     if (page === owner._childrenCount + 1) {
                         //    selectedIndexProperty.nativeValueChange(owner, 0);
                     } else {
                         //   selectedIndexProperty.nativeValueChange(owner, page - 1);
                     }

                 }
             } */

            /* if(owner){
                 let width = 0;
                 let w = (layout.toDeviceIndependentPixels(owner._effectiveItemWidth) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
                 let h = (layout.toDeviceIndependentPixels(owner._effectiveItemHeight) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
                 width = scrollView.contentOffset.x / w;
                 if (!Number.isNaN(width)) {
                     let page = Math.ceil(width);
                     const doScroll = () => {
                         if (!Number.isNaN(width)) {
                             const point = CGPointMake(Math.ceil(w) * page, scrollView.contentOffset.y);
                             scrollView.setContentOffsetAnimated(point, false);
                         }
                     };
                     if (page === 0) {
                         page = owner.itemCount - 2;
                         doScroll();
                         selectedIndexProperty.nativeValueChange(owner, owner.itemCount - 3);
                     } else if (page === owner.itemCount -1) {
                         page = 1;
                         doScroll();
                         selectedIndexProperty.nativeValueChange(owner, 0);
                     } else {
                         if(page === owner.itemCount + 1){
                             selectedIndexProperty.nativeValueChange(owner, 0);
                         }else {
                             selectedIndexProperty.nativeValueChange(owner, page - 1);
                         }
                     }
                 }
             } */


            //scrollView.setContentOffsetAnimated(CGPointMake((w * width) + 1, 0),false);
            //(owner.nativeView as UICollectionView).setContentOffsetAnimated(CGPointMake((w * width) + 1, 0),false);
        }
    }

    private _nextIndex: number;

    scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void {
        if (!decelerate) {
            // (scrollView as any).scrollToItemAtIndexPathAtScrollPositionAnimated(
            //     NSIndexPath.indexPathForRowInSection(this._getIndex(scrollView), 0), UICollectionViewScrollPosition.CenteredHorizontally, true
            // );
        }
    }

    private _getRealWidthHeight(): { width: number, height: number } {
        const owner = this._owner && this._owner.get();
        let height = 0;
        let width = 0;
        if (owner) {
            width = (layout.toDeviceIndependentPixels(owner._effectiveItemWidth) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
            height = (layout.toDeviceIndependentPixels(owner._effectiveItemHeight) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
        }
        return {height, width};
    }

    private _getIndex(scrollView: UIScrollView) {
        let index = 0;
        const owner = this._owner && this._owner.get();
        if (owner) {
            let offset: number;
            let itemSize = this._getRealWidthHeight();
            let size: number;
            if (owner.orientation === 'vertical') {
                offset = scrollView.contentOffset.y;
                size = itemSize.height;
            } else {
                offset = scrollView.contentOffset.x;
                size = itemSize.width;
            }
            index = parseInt(Number(offset / size).toFixed(0), 10);
        }
        return index;
    }

    public scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>) {
        let owner = this._owner ? this._owner.get() : null;

        if (!owner) return;

        if (owner.lastEvent === 1) {
            owner.notify({
                eventName: Pager.swipeEndEvent,
                object: owner
            });
            owner.lastEvent = 0;
        }
        const collection = owner.pager as UICollectionView;
        const contentSize = owner.orientation === 'vertical' ? collection.contentSize.height : collection.contentSize.width;
        if (contentSize === 0) {
            return;
        }

        const target = (targetContentOffset as any).value;

        const size = this._getRealWidthHeight();
        let width = 0;
        let currentVelocity = 0;
        let offset = 0;
        if (owner.orientation === 'vertical') {
            currentVelocity = velocity.y;
            offset = this._startingScrollingOffset.y;
            width = size.height;
        } else {
            currentVelocity = velocity.x;
            offset = this._startingScrollingOffset.x;
            width = size.width;
        }

        let next = 0;
        if (currentVelocity >= 0.5) {
            next = 1;
            this._indexOfCellBeforeDragging = Math.floor(offset / width);
            this._indexOfCellBeforeDragging = Math.min(this._indexOfCellBeforeDragging, owner.selectedIndex);
        } else if (currentVelocity <= -0.5) {
            next = -1;
            this._indexOfCellBeforeDragging = Math.round(offset / width);
            this._indexOfCellBeforeDragging = Math.min(this._indexOfCellBeforeDragging, owner.selectedIndex);
        } else {
            this._indexOfCellBeforeDragging = Math.floor(offset / width);
            scrollView.setContentOffsetAnimated(CGPointMake(target.x, target.y), false);
            // set offset as current offset then animate scroll to stop jank
            (scrollView as any).scrollToItemAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForRowInSection(owner.selectedIndex, 0), UICollectionViewScrollPosition.CenteredHorizontally, true
            );
            return;
        }
        let nextIndex = this._indexOfCellBeforeDragging + next;
        if (owner.circularMode) {
            if (nextIndex === 0) {
                nextIndex = owner.itemCount - 2;
            } else if (nextIndex === owner.itemCount - 1) {
                nextIndex = 1;
            } else if (nextIndex > (owner.itemCount - 1)) {
                nextIndex = (owner.itemCount - 1);
            }
        } else {
            if (nextIndex <= -1) {
                nextIndex = 0;
            } else if (nextIndex >= owner.lastIndex) {
                nextIndex = owner.lastIndex;
            }
        }
        this._nextIndex = nextIndex;
        (targetContentOffset as any).value = this._getPointFromAttrOffset(collection.collectionViewLayout.layoutAttributesForItemAtIndexPath(NSIndexPath.indexPathForRowInSection(nextIndex, 0)), target);
        setTimeout(() => {
            selectedIndexProperty.nativeValueChange(owner, nextIndex);
        });
    }

    private _getPointFromAttrOffset(attribute, target) {
        const owner = this._owner && this._owner.get();
        if (owner) {
            const x = owner.orientation === 'vertical' ? target.x : attribute.frame.origin.x - (owner._getSpacing() + owner._getPeaking());
            const y = owner.orientation === 'vertical' ? attribute.frame.origin.y - (owner._getSpacing() + owner._getPeaking()) : target.y;
            return CGPointMake(x, y);
        }
        return CGPointZero;
    }
}

@NativeClass
@ObjCClass(UICollectionViewDataSource)
class UICollectionViewDataSourceImpl extends NSObject
    implements UICollectionViewDataSource {
    _owner: WeakRef<Pager>;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionViewDataSourceImpl {
        const delegate = UICollectionViewDataSourceImpl.alloc().init() as UICollectionViewDataSourceImpl;
        delegate._owner = owner;
        return delegate;
    }


    public collectionViewCellForItemAtIndexPath(collectionView: UICollectionView,
                                                indexPath: NSIndexPath): UICollectionViewCell {
        const owner = this._owner ? this._owner.get() : null;
        let cell;
        let count = 0;
        if (owner) {
            count = owner._childrenCount;
            if (owner.circularMode) {
                count = owner.itemCount;
                switch (indexPath.row) {
                    case 0:
                        indexPath = NSIndexPath.indexPathForRowInSection(owner.lastDummy, 0);
                        break;
                    case owner.firstDummy:
                        indexPath = NSIndexPath.indexPathForRowInSection(0, 0);
                        break;
                    default:
                        indexPath = NSIndexPath.indexPathForRowInSection(indexPath.row - 1, 0);
                        break;
                }
            }
        }
        if (owner && !owner.items && count > 0) {
            owner._preparingCell = true;
            const size = owner._getSize();
            collectionView.registerClassForCellWithReuseIdentifier(PagerCell.class(), `static-${indexPath.row}`);
            cell =
                collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                    `static-${indexPath.row}`,
                    indexPath
                ) || PagerCell.initWithEmptyBackground();
            cell.index = indexPath;
            let view = owner._childrenViews.get(indexPath.row);

            if (view instanceof ProxyViewContainer) {
                let sp = new StackLayout();
                sp.addChild(view);
                view = sp;
            }

            // If cell is reused it has old content - remove it first.
            if (!cell.view) {
                cell.owner = new WeakRef(view);
            } else if (cell.view !== view) {
                /*
                if (!(view.parent instanceof Pager)) {
                    owner._removeView(view.parent);
                }
                view.parent._removeView(view);
                */
                (cell.view.ios as UIView).removeFromSuperview();
                cell.owner = new WeakRef(view);
            }

            if (view && !view.parent) {
                owner._addView(view);
                cell.contentView.addSubview(view.ios);
            } else if (view && view.ios) {
                cell.contentView.addSubview(view.ios);
            }

            owner._layoutCell(view, indexPath);
            let width = layout.toDevicePixels(size.width);
            let height = layout.toDevicePixels(size.height);
            if (view && (view as any).isLayoutRequired) {
                View.layoutChild(owner, view, 0, 0, width, height);
            }
            owner._preparingCell = false;
            return cell;
        }

        const template = owner && owner._getItemTemplate(indexPath.row);
        cell =
            collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                template.key,
                indexPath
            ) || PagerCell.initWithEmptyBackground();
        cell.index = indexPath;
        if (owner) {
            const size = owner._getSize();
            owner._prepareCell(<PagerCell>cell, indexPath);
            const cellView: any = (cell as PagerCell).view;
            if (cellView && cellView.isLayoutRequired) {
                View.layoutChild(owner, cellView, 0, 0, layout.toDevicePixels(size.width), layout.toDevicePixels(size.height));
            }
        }

        return cell;
    }


    public collectionViewNumberOfItemsInSection(collectionView: UICollectionView,
                                                section: number): number {
        const owner = this._owner ? this._owner.get() : null;
        if (!owner) return 0;
        return owner.circularMode ? owner.itemCount : owner._childrenCount;
    }

    public numberOfSectionsInCollectionView(collectionView: UICollectionView): number {
        return 1;
    }
}

@NativeClass
class UICollectionViewFlowLinearLayoutImpl extends UICollectionViewFlowLayout {
    _owner: WeakRef<Pager>;
    _curl: CATransition;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionViewFlowLinearLayoutImpl {
        const layout = UICollectionViewFlowLinearLayoutImpl.new() as UICollectionViewFlowLinearLayoutImpl;
        layout._owner = owner;
        layout._curl = CATransition.animation();
        return layout;
    }

    public layoutAttributesForElementsInRect(rect: CGRect) {
        let owner = this._owner ? this._owner.get() : null;
        const originalLayoutAttribute = super.layoutAttributesForElementsInRect(rect);
        let visibleLayoutAttributes = [];
        if (owner) {
            if (owner.transformers && owner.transformers.indexOf('scale') > -1) {
                const count = originalLayoutAttribute.count;
                for (let i = 0; i < count; i++) {
                    let attributes = originalLayoutAttribute.objectAtIndex(i);
                    visibleLayoutAttributes[i] = attributes;
                    const frame = attributes.frame;
                    const width = attributes.frame.size.width * .75;
                    const height = attributes.frame.size.height * .75;
                    attributes.frame.size.width = width;
                    attributes.frame.size.height = height;
                    const spacing = owner.convertToSize(owner.spacing);
                    const distance = Math.abs(this.collectionView.contentOffset.x + this.collectionView.contentInset.left + spacing - frame.origin.x);
                    const scale = Math.min(Math.max(1 - distance / (this.collectionView.bounds.size.width), .75), 1);
                    attributes.transform = CGAffineTransformScale(attributes.transform, 1, scale);
                }
            } else {
                return originalLayoutAttribute;
            }
        }
        return <any>visibleLayoutAttributes;
    }

    public shouldInvalidateLayoutForBoundsChange(newBounds: CGRect): boolean {
        return true;
    }

    public initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes {
        const attrs = super.initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath);
        attrs.alpha = 1;
        return attrs;
    }

    public finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes {
        const attrs = super.finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath);
        attrs.alpha = 1;
        return attrs;
    }

}
