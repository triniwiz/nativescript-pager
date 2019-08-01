import { EventData, KeyedTemplate, layout, View } from 'tns-core-modules/ui/core/view';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { ProxyViewContainer } from 'tns-core-modules/ui/proxy-view-container';
import * as common from './pager.common';
import {
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
import { profile } from 'tns-core-modules/profiling';
import { ChangeType, ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';

export { Transformer } from './pager.common';

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
    CHIPageControlJalapeno, CHIPageControlJaloro, CHIPageControlPuya;

const main_queue = dispatch_get_current_queue();
export * from './pager.common';

export class Pager extends PagerBase {
    lastEvent: number = 0;
    private _disableSwipe: boolean = false;
    private _disableAnimation: boolean = false;
    _layout: any;  /*UICollectionViewFlowLinearLayoutImpl*/
    private _initialLoad: boolean = false;
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
        this.pager.alpha = 0;
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

    private _setNativeClipToBounds(): void {
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

    private _updateScrollPosition() {
        const view = (this.pager as UICollectionView);
        if (!view || view.contentSize.width === 0) {
            return;
        }
        if (this.indicatorView) {
            this.indicatorView.progress = this.selectedIndex;
        }
        this._scrollToIndexAnimated(this.selectedIndex, false);
        /*
        Which is better ?
        const size = this._getSize();
        UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
            0.0,
            0,
            1,
            0.0,
            UIViewAnimationOptions.AllowUserInteraction,
            () => {
                let x = this.orientation === 'vertical' ? 0 : this.selectedIndex * size.width;
                const y = this.orientation === 'vertical' ? this.selectedIndex * size.height : 0;
                x = x + (this._getSpacing() + this._getPeaking());
                view.contentOffset = CGPointMake(x, y);
            },
            null
        );*/
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
                this.ios.registerClassForCellWithReuseIdentifier(
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
        if (value instanceof ObservableArray) {
            value.on('change', (args) => {
                if (!this.pager) {
                    return;
                }
                if (this.indicatorView && value && value.length) {
                    this.indicatorView.numberOfPages = value.length;
                }
                dispatch_async(main_queue, () => {
                    const collectionView = this.pager as UICollectionView;
                    collectionView.performBatchUpdatesCompletion(() => {
                        this._isRefreshing = true;
                        const array = [];
                        let count = 0;
                        switch (args.action) {
                            case ChangeType.Add:
                                count = args.index + args.addedCount;
                                for (let i = args.index; i < count; i++) {
                                    array.push(NSIndexPath.indexPathForRowInSection(i, 0));
                                }
                                collectionView.insertItemsAtIndexPaths(array);
                                break;
                            case ChangeType.Delete:
                                args.removed.forEach(item => {
                                    const index = (this.items as Array<any>).indexOf(item);
                                    if (index > -1) {
                                        array.push(NSIndexPath.indexPathForItemInSection(index, 0));
                                    }
                                });
                                if (array.length > 0) {
                                    collectionView.deleteItemsAtIndexPaths(array);
                                }
                                break;
                            case  ChangeType.Splice:
                                if (args.removed && args.removed.length > 0) {
                                    count = args.index + args.removed.length;
                                    for (let i = args.index; i < count; i++) {
                                        array.push(NSIndexPath.indexPathForRowInSection(i, 0));
                                    }
                                    if (array.length > 0) {
                                        collectionView.deleteItemsAtIndexPaths(array);
                                    }
                                }
                                if (args.addedCount > 0) {
                                    const addedArray = [];
                                    count = args.index + args.addedCount;
                                    for (let i = args.index; i < count; i++) {
                                        addedArray.push(NSIndexPath.indexPathForRowInSection(i, 0));
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
                    }, null);
                });
            });
        } else {
            this.refresh();
        }
        selectedIndexProperty.coerce(this);
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
                this.nativeView.removeFromSuperview();
            }
        }
    }

    _onItemsChanged(oldValue: any, newValue: any): void {
    }

    _scrollToIndexAnimated(index: number, animate: boolean) {
        if (!this._pager) return;
        if (this._pager.contentSize.width === 0) {
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

        this.pager.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(maxMinIndex, 0), this.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, !!animate);
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        this._scrollToIndexAnimated(index, animate);
    }

    private _reset() {
        if (!this.pager) {
            return;
        }
        this.pager.alpha = 0;
        this.pager.reloadData();
        this.pager.collectionViewLayout.invalidateLayout();
        this._updateScrollPosition();

        UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
            1.0,
            0,
            1.0,
            0.0,
            UIViewAnimationOptions.AllowUserInteraction,
            () => {
                this.pager.alpha = 1;
            },
            null
        );
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
        if (this.indicatorView) {
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

    private _setPadding(newPadding: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    }) {
        const padding = {
            top: this._layout.sectionInset.top,
            right: this._layout.sectionInset.right,
            bottom: this._layout.sectionInset.bottom,
            left: this._layout.sectionInset.left
        };
        // tslint:disable-next-line:prefer-object-spread
        const newValue = Object.assign(padding, newPadding);
        this._layout.sectionInset = UIEdgeInsetsFromString(
            `{${newValue.top},${newValue.left},${newValue.bottom},${newValue.right}}`
        );
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

export class PagerCell extends UICollectionViewCell {
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

@ObjCClass(UICollectionViewDelegate, UICollectionViewDelegateFlowLayout)
class UICollectionDelegateImpl extends NSObject
    implements UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    _owner: WeakRef<Pager>;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionDelegateImpl {
        const delegate = UICollectionDelegateImpl.alloc().init() as UICollectionDelegateImpl;
        delegate._owner = owner;
        delegate.startingScrollingOffset = CGPointMake(0, 0);
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
        let owner = this._owner ? this._owner.get() : null;
        if (!owner) return CGSizeZero;
        const size = owner._getSize();
        return CGSizeMake(size.width, size.height);
    }

    public collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView,
                                                           cell: UICollectionViewCell,
                                                           indexPath: NSIndexPath) {
        const owner = this._owner ? this._owner.get() : null;
        if (owner) {
            if (owner.items && indexPath.row === owner.items.length - owner.loadMoreCount) {
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

    startingScrollingOffset;

    currentPage = 0;

    indexOfCellBeforeDragging = 0;


    scrollViewWillBeginDragging(scrollView: UIScrollView): void {
        this.startingScrollingOffset = scrollView.contentOffset;
        let owner = this._owner ? this._owner.get() : null;
        if (owner) {
            if (owner.lastEvent === 0) {
                owner.notify({
                    eventName: Pager.swipeStartEvent,
                    object: owner
                });
                owner.lastEvent = 1;
            }
            this.indexOfCellBeforeDragging = owner.selectedIndex;
        }
    }

    scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void {
        let owner = this._owner ? this._owner.get() : null;
        if (owner) {
            owner.notify({
                eventName: Pager.swipeEvent,
                object: owner
            });
            if (owner.indicatorView) {
                owner.indicatorView.progress = owner.selectedIndex;
            }
        }
    }

    public scrollViewDidScroll(scrollView: UIScrollView): void {
        let owner = this._owner.get();
        if (owner) {
            let width = 0;
            let w = (layout.toDeviceIndependentPixels(owner._effectiveItemWidth) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
            let h = (layout.toDeviceIndependentPixels(owner._effectiveItemHeight) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
            width = scrollView.contentOffset.x / w;
            if (owner.indicatorView && owner.indicatorView.setWithProgressAnimated) {
                owner.indicatorView.setWithProgressAnimated(width, true);
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
        }
    }

    scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>) {
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

        let currentVelocity = 0;
        if (owner.orientation === 'vertical') {
            currentVelocity = velocity.y;
        } else {
            currentVelocity = velocity.x;
        }

        let next = 0;
        if (currentVelocity > 0.5) {
            next = 1;
        } else if (currentVelocity < -0.5) {
            next = -1;
        }

        const v = owner.orientation === 'vertical' ? target.y - this.startingScrollingOffset.y : target.x - this.startingScrollingOffset.x;
        let w = (layout.toDeviceIndependentPixels(owner._effectiveItemWidth) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
        let h = (layout.toDeviceIndependentPixels(owner._effectiveItemHeight) - (((owner.perPage * 2) * owner._getSpacing()) + (owner._getPeaking() * 2))) / owner.perPage;
        const center = (owner.orientation === 'vertical' ? h / 2 : w / 2);
        if (next === 0) {
            if (v < 0) {
                if (v <= -center) {
                    next = -1;
                }
            } else if (v > 0) {
                if (v >= center) {
                    next = 1;
                }
            }
        }

        if (next > 1) {
            next = 1;
        } else if (next < -1) {
            next = -1;
        }

        const nextIndex = this.indexOfCellBeforeDragging + next;
        const attribute = collection.collectionViewLayout.layoutAttributesForItemAtIndexPath(NSIndexPath.indexPathForRowInSection(nextIndex, 0));
        const x = owner.orientation === 'vertical' ? target.x : attribute.frame.origin.x - (owner._getSpacing() + owner._getPeaking());
        const y = owner.orientation === 'vertical' ? attribute.frame.origin.y - (owner._getSpacing() + owner._getPeaking()) : target.y;
        (targetContentOffset as any).value = CGPointMake(x, y);
        selectedIndexProperty.nativeValueChange(owner, nextIndex);
    }

}

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
        if (owner && !owner.items && owner._childrenCount > 0) {
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
        return owner._childrenCount;
    }

    public numberOfSectionsInCollectionView(collectionView: UICollectionView): number {
        return 1;
    }
}

class UICollectionViewFlowLinearLayoutImpl extends UICollectionViewFlowLayout {
    _owner: WeakRef<Pager>;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionViewFlowLinearLayoutImpl {
        const layout = UICollectionViewFlowLinearLayoutImpl.alloc().init() as UICollectionViewFlowLinearLayoutImpl;
        layout._owner = owner;
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
}
