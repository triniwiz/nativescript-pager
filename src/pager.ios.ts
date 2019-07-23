import { EventData, KeyedTemplate, layout, Length, View } from 'tns-core-modules/ui/core/view';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { ProxyViewContainer } from 'tns-core-modules/ui/proxy-view-container';
import * as common from './pager.common';
import {
    disableSwipeProperty,
    ItemEventData,
    ITEMLOADING,
    ITEMDISPOSING,
    itemsProperty,
    itemTemplatesProperty,
    LOADMOREITEMS,
    Orientation,
    orientationProperty,
    paddingBottomProperty,
    paddingLeftProperty,
    paddingRightProperty,
    paddingTopProperty,
    PagerBase,
    selectedIndexProperty,
    Transformer
} from './pager.common';
import { profile } from 'tns-core-modules/profiling';

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

const main_queue = dispatch_get_current_queue();

global.moduleMerge(common, exports);

export class Pager extends PagerBase {
    lastEvent: number = 0;
    private _disableSwipe: boolean = false;
    private _disableAnimation: boolean = false;
    public perPage: number;
    _layout: any;  /*UICollectionViewFlowLinearLayoutImpl*/
    private _initialLoad: boolean = false;
    _preparingCell: boolean = false;
    _ios: any; /*UICollectionView*/
    _delegate: any; /*UICollectionDelegateImpl*/
    private _dataSource;
    public _measuredMap: Map<number, CGSize>;
    _map: Map<PagerCell, View>;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;
    private _isDataDirty: boolean = false;
    private _previousIndex: number = -1;

    constructor() {
        super();
        this._map = new Map<PagerCell, View>();
        this._measuredMap = new Map<number, CGSize>();
        this._childrenViews = new Map<number, View>();
    }

    createNativeView() {
        this._layout = UICollectionViewFlowLinearLayoutImpl.initWithOwner(
            new WeakRef(this)
        );
        this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
        this._layout.minimumLineSpacing = 0;
        this._layout.minimumInteritemSpacing = 0;
        this._ios = UICollectionView.alloc().initWithFrameCollectionViewLayout(CGRectZero,
            this._layout);
        this._ios.showsHorizontalScrollIndicator = false;
        this._ios.showsVerticalScrollIndicator = false;
        this._ios.decelerationRate = UIScrollViewDecelerationRateFast;
        return this._ios;
    }

    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
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
        } else {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
            nativeView.alwaysBounceHorizontal = true;
        }
        this._delegate = UICollectionDelegateImpl.initWithOwner(new WeakRef(this));
        this._setNativeClipToBounds();
    }

    get ios(): any /*UICollectionView*/ {
        return this._ios;
    }

    public get _childrenCount() {
        return this.items ? this.items.length : this._childrenViews ? this._childrenViews.size : 0;
    }


    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    private _setNativeClipToBounds(): void {
        this.ios.clipsToBounds = true;
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

    updateNativeIndex(oldIndex: number, newIndex: number) {
        if (this.isLoaded) {
            this.scrollToIndexAnimated(newIndex, !this.disableAnimation);
        }
    }

    updateNativeItems(oldItems: View[], newItems: View[]) {
    }

    public [paddingTopProperty.getDefault](): number {
        return this._layout.sectionInset.top;
    }

    public [paddingTopProperty.setNative](value: Length) {
        (this as any)._setPadding({
            top: layout.toDeviceIndependentPixels(this.effectivePaddingTop)
        });
    }

    public [paddingRightProperty.getDefault](): number {
        return this._layout.sectionInset.right;
    }

    public [paddingRightProperty.setNative](value: Length) {
        (this as any)._setPadding({
            right: layout.toDeviceIndependentPixels(this.effectivePaddingRight)
        });
    }

    public [paddingBottomProperty.getDefault](): number {
        return this._layout.sectionInset.bottom;
    }

    public [paddingBottomProperty.setNative](value: Length) {
        (this as any)._setPadding({
            bottom: layout.toDeviceIndependentPixels(this.effectivePaddingBottom)
        });
    }

    public [paddingLeftProperty.getDefault](): number {
        return this._layout.sectionInset.left;
    }

    public [paddingLeftProperty.setNative](value: Length) {
        (this as any)._setPadding({
            left: layout.toDeviceIndependentPixels(this.effectivePaddingLeft)
        });
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

        this.refresh();

    }

    [itemsProperty.setNative](value: any[]) {
        selectedIndexProperty.coerce(this);
    }

    private _scrollToIndexAnimated(index: number, animate: boolean) {
        if (!this.ios) return;
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

        this.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(maxMinIndex, 0), this.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, !!animate);
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        this._scrollToIndexAnimated(index, animate);
    }

    private _refresh() {
        this.ios.reloadData();
        this.ios.collectionViewLayout.invalidateLayout();
        this.ios.layoutIfNeeded();
    }

    refresh() {
        if (this.isLoaded) {
            this._previousIndex = this.selectedIndex;
            if (this.ios) {
                dispatch_async(main_queue, () => {
                    this._refresh();
                    if (!this._initialLoad) {
                        this._scrollToIndexAnimated(this.selectedIndex, false);
                        this._initialLoad = true;
                    } else if (this.selectedIndex !== this._previousIndex) {
                        this._scrollToIndexAnimated(this.selectedIndex, false);
                    }
                    this._isDataDirty = false;
                });

            }
        } else {
            this._isDataDirty = true;
        }
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        if (this._isDataDirty) {
            this.refresh();
        }
        if (!this.items && this._childrenCount > 0) {
            selectedIndexProperty.coerce(this);
        }

        this.ios.delegate = this._delegate;

        if (!this.items && this._childrenCount > 0) {
            setTimeout(() => {
                this._scrollToIndexAnimated(this.selectedIndex, false);
            }, 0);
        }
    }

    public onUnloaded() {
        if (this.ios) {
            this.ios.delegate = null;
        }
        super.onUnloaded();
    }

    [disableSwipeProperty.setNative](value: boolean) {
        if (this.ios) {
            this.ios.scrollEnabled = !(String(this.disableSwipe) === 'true');
        }
        this._disableSwipe = String(this.disableSwipe) === 'true';
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
        if (indexPath) {
            this._measuredMap.delete(indexPath.row);
        }
    }

    public disposeNativeView() {
        this._delegate = null;
        this._dataSource = null;
        super.disposeNativeView();
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const changed = (this as any)._setCurrentMeasureSpecs(
            widthMeasureSpec,
            heightMeasureSpec
        );
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            if (this.ios) {
                this.ios.performBatchUpdatesCompletion(() => {
                    this.ios.alpha = 0;
                    this._initialLoad = false;
                    this._refresh();
                    this._scrollToIndexAnimated(this.selectedIndex, false);
                    this.ios.alpha = 1;
                }, null);
            }
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
        this._map.forEach((childView, pagerCell) => {
            const peaking = this.convertToSize(this.peaking);
            const spacing = this.convertToSize(this.spacing);
            const width = (this._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / this.perPage;
            const height = this._effectiveItemHeight;
            View.layoutChild(this, childView, 0, 0, width < 0 ? 0 : width, height < 0 ? 0 : height);
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

    private _layoutCell(cellView: View, index: NSIndexPath) {
        if (cellView) {
            const peaking = this.convertToSize(this.peaking);
            const spacing = this.convertToSize(this.spacing);
            let width = (this._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / this.perPage;
            let height = this._effectiveItemHeight;

            if (this._measuredMap && this._measuredMap.has(index.row)) {
                const size = this._measuredMap.get(index.row);
                width = layout.toDevicePixels(size.width);
                height = layout.toDevicePixels(size.height);
            }

            const widthMeasureSpec = layout.makeMeasureSpec(width, layout.EXACTLY);

            const heightMeasureSpec = layout.makeMeasureSpec(height, layout.EXACTLY);
            View.measureChild(
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
        return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.x : 0;
    }

    get verticalOffset(): number {
        return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.y : 0;
    }
}

export class PagerCell extends UICollectionViewCell {
    public owner: WeakRef<View>;

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
            parent._removeContainer(this);
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
            const peaking = owner.convertToSize(owner.peaking);
            const spacing = owner.convertToSize(owner.spacing);
            const inset = layout.toDeviceIndependentPixels(peaking + spacing);
            if (owner.orientation === 'vertical') {
                return new UIEdgeInsets({ bottom: inset, left: 0, right: 0, top: inset });
            }

            return new UIEdgeInsets({ bottom: 0, left: inset, right: inset, top: 0 });
        }
        return new UIEdgeInsets({ bottom: 0, left: 0, right: 0, top: 0 });
    }


    public collectionViewLayoutSizeForItemAtIndexPath(collectionView: UICollectionView,
        collectionViewLayout: UICollectionViewLayout,
        indexPath: NSIndexPath): CGSize {
        let owner = this._owner ? this._owner.get() : null;
        let width;
        let height;
        if (!owner) return CGSizeZero;
        const peaking = owner.convertToSize(owner.peaking);
        const spacing = owner.convertToSize(owner.spacing);
        width = (owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / owner.perPage;
        height = owner._effectiveItemHeight;
        const nativeWidth = layout.toDeviceIndependentPixels(width);
        const nativeHeight = layout.toDeviceIndependentPixels(height);
        const size = CGSizeMake(
            nativeWidth < 0 ? 0 : nativeWidth,
            nativeHeight < 0 ? 0 : nativeHeight
        );
        owner._measuredMap.set(indexPath.row, size);
        return size;
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
        return layout.toDeviceIndependentPixels(owner.convertToSize(owner.spacing));
    }

    startingScrollingOffset;

    currentPage = 0;

    indexOfMajorCell(): number {
        let owner = this._owner ? this._owner.get() : null;
        if (!owner) return 0;
        const spacing = owner.convertToSize(owner.spacing);
        const peaking = owner.convertToSize(owner.peaking);
        let width = layout.toDeviceIndependentPixels(((owner.orientation === 'horizontal' ? owner._effectiveItemWidth : owner._effectiveItemHeight) - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / owner.perPage);
        let proportionalOffset = (owner.orientation === 'horizontal' ? owner.ios.contentOffset.x : owner.ios.contentOffset.y) / width;
        let index = round(proportionalOffset);
        let numberOfItems = owner._childrenCount;
        return Math.max(0, Math.min(numberOfItems - 1, index));
    }

    indexOfCellBeforeDragging = 0;

    scrollViewWillBeginDragging(scrollView: UIScrollView): void {
        this.startingScrollingOffset = scrollView.contentOffset;
        this.indexOfCellBeforeDragging = this.indexOfMajorCell();
        let owner = this._owner ? this._owner.get() : null;
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

    scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void {
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

        // Stop scrollView sliding:
        (targetContentOffset as any).value = scrollView.contentOffset;

        // calculate where scrollView should snap to:
        let indexOfMajorCell = this.indexOfMajorCell();

        // calculate conditions:
        let dataSourceCount = owner._childrenCount;
        let swipeVelocityThreshold = 0.5; // after some trail and error
        let hasEnoughVelocityToSlideToTheNextCell = this.indexOfCellBeforeDragging + 1 < dataSourceCount && (owner.orientation === 'horizontal' ? velocity.x : velocity.y) > swipeVelocityThreshold;
        let hasEnoughVelocityToSlideToThePreviousCell = this.indexOfCellBeforeDragging - 1 >= 0 && (owner.orientation === 'horizontal' ? velocity.x : velocity.y) < -swipeVelocityThreshold;
        let majorCellIsTheCellBeforeDragging = indexOfMajorCell === this.indexOfCellBeforeDragging;
        let didUseSwipeToSkipCell = majorCellIsTheCellBeforeDragging && (hasEnoughVelocityToSlideToTheNextCell || hasEnoughVelocityToSlideToThePreviousCell);

        if (didUseSwipeToSkipCell) {

            let snapToIndex = this.indexOfCellBeforeDragging + (hasEnoughVelocityToSlideToTheNextCell ? 1 : -1);
            if (snapToIndex < 0) {
                snapToIndex = 0;
            } else if (snapToIndex > dataSourceCount - 1) {
                snapToIndex = dataSourceCount - 1;
            }

            const spacing = owner.convertToSize(owner.spacing);
            const peaking = owner.convertToSize(owner.peaking);
            let width = layout.toDeviceIndependentPixels(((owner.orientation === 'horizontal' ? owner._effectiveItemWidth : owner._effectiveItemHeight) - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / owner.perPage);
            let height = (owner.orientation === 'horizontal' ? owner._effectiveItemHeight : owner._effectiveItemWidth);

            let toValue = width * snapToIndex;

            // Damping equal 1 => no oscillations => decay animation:
            /*UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
                0.1,
                0,
                1,
                velocity.x,
                UIViewAnimationOptions.AllowUserInteraction,
                () => {
                    // scrollView.contentOffset = CGPointMake(toValue, 0);
                    // scrollView.layoutIfNeeded();
                },
                null
            );
            */

            this.currentPage = snapToIndex;
            owner.scrollToIndexAnimated(snapToIndex, true);
        } else {
            this.currentPage = indexOfMajorCell;
            owner.scrollToIndexAnimated(indexOfMajorCell, true);
        }
        owner.selectedIndex = this.currentPage;

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
        let width;
        let height;
        if (owner && !owner.items && owner._childrenCount > 0) {
            owner._preparingCell = true;
            collectionView.registerClassForCellWithReuseIdentifier(PagerCell.class(), `static-${indexPath.row}`);
            cell =
                collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                    `static-${indexPath.row}`,
                    indexPath
                ) || PagerCell.initWithEmptyBackground();
            let view = owner._childrenViews.get(indexPath.row);
            const peaking = owner.convertToSize(owner.peaking);
            const spacing = owner.convertToSize(owner.spacing);
            width = (owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / owner.perPage;
            height = owner._effectiveItemHeight;


            if (view instanceof ProxyViewContainer) {
                let sp = new StackLayout();
                sp.addChild(view);
                view = sp;
            }

            // If cell is reused it have old content - remove it first.
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

            const widthMeasureSpec = layout.makeMeasureSpec(width, layout.EXACTLY);

            const heightMeasureSpec = layout.makeMeasureSpec(height, layout.EXACTLY);

            View.measureChild(
                owner,
                view,
                widthMeasureSpec,
                heightMeasureSpec
            );

            View.layoutChild(owner, view, 0, 0, width < 0 ? 0 : width, height < 0 ? 0 : height);
            owner._preparingCell = false;
            return cell;
        }

        const template = owner && owner._getItemTemplate(indexPath.row);

        if (!(String(owner.cache) === 'true')) {
            collectionView.registerClassForCellWithReuseIdentifier(PagerCell.class(), `${template.key}-${indexPath.row}`);
            cell =
                collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                    `${template.key}-${indexPath.row}`,
                    indexPath
                ) || PagerCell.initWithEmptyBackground();
        } else {
            cell =
                collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                    template.key,
                    indexPath
                ) || PagerCell.initWithEmptyBackground();
        }

        if (owner) {
            owner._prepareCell(<PagerCell>cell, indexPath);
            const cellView: any = (cell as PagerCell).view;

            if (cellView && cellView.isLayoutRequired) {
                if (owner._measuredMap && owner._measuredMap.has(indexPath.row)) {
                    const size = owner._measuredMap.get(indexPath.row);
                    width = layout.toDevicePixels(size.width);
                    height = layout.toDevicePixels(size.height);
                } else {
                    const peaking = owner.convertToSize(owner.peaking);
                    const spacing = owner.convertToSize(owner.spacing);
                    width = (owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0)) / owner.perPage;
                    height = owner._effectiveItemHeight;
                }
                View.layoutChild(owner, cellView, 0, 0, width < 0 ? 0 : width, height < 0 ? 0 : height);
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

    previousOffset = 0;
    currentPage = 0;

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
            if (owner.transformer === 'scale') {
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

    public shouldInvalidateLayoutForBoundsChange(): boolean {
        return true;
    }

}
