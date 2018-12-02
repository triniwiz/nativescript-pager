import { EventData, KeyedTemplate, layout, Length, View } from 'tns-core-modules/ui/core/view';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { ProxyViewContainer } from 'tns-core-modules/ui/proxy-view-container';
import * as common from './pager.common';
import {
    ItemEventData,
    ITEMLOADING,
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
    private _disableSwipe: boolean;
    private _disableAnimation: boolean;
    _layout: UICollectionViewFlowLinearLayoutImpl;

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    _preparingCell: boolean;
    _ios: UICollectionView;
    _delegate: UICollectionDelegateImpl;
    private _dataSource;
    public _measuredMap: Map<number, CGSize>;
    _map: Map<PagerCell, View>;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;
    private _isDataDirty: boolean;

    constructor() {
        super();
        this._map = new Map<PagerCell, View>();
        this._measuredMap = new Map<number, CGSize>();
    }

    createNativeView() {
        this._layout = UICollectionViewFlowLinearLayoutImpl.initWithOwner(
            new WeakRef(this)
        );
        this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
        this._layout.minimumLineSpacing = 0;
        this._layout.minimumInteritemSpacing = 0;
        this._ios = UICollectionView.alloc().initWithFrameCollectionViewLayout(
            CGRectZero,
            this._layout
        );
        this._ios.alwaysBounceHorizontal = false;
        this._ios.alwaysBounceVertical = false;
        this._ios.showsHorizontalScrollIndicator = false;
        this._ios.showsVerticalScrollIndicator = false;
        this._ios.decelerationRate = UIScrollViewDecelerationRateFast;
        return this._ios;
    }

    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        nativeView.backgroundColor = UIColor.clearColor;
        nativeView.autoresizesSubviews = false;
        nativeView.autoresizingMask = UIViewAutoresizing.None;

        nativeView.registerClassForCellWithReuseIdentifier(
            PagerCell.class(),
            this._defaultTemplate.key
        );

        nativeView.dataSource = this._dataSource = UICollectionViewDataSourceImpl.initWithOwner(
            new WeakRef(this)
        );

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

    get ios(): UICollectionView {
        return this.nativeViewProtected;
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
        if (this.ios && this.isLoaded) {
            this.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(newIndex, 0), this.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, !this.disableAnimation);
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

    refresh() {
        if (this.isLoaded) {
            if (this.ios) {
                dispatch_async(main_queue, () => {
                    this.ios.reloadData();
                    this.ios.collectionViewLayout.invalidateLayout();
                    this.ios.layoutIfNeeded();
                    if (this.selectedIndex > 0) {
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(this.selectedIndex, 0), this.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, false);
                    }
                });
            }
            this._isDataDirty = false;
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
        this.ios.delegate = this._delegate;
    }

    public onUnloaded() {
        if (this.ios) {
            this.ios.delegate = null;
        }
        super.onUnloaded();
    }

    get disableSwipe(): boolean {
        return this._disableSwipe;
    }

    set disableSwipe(value: boolean) {
        this._disableSwipe = value;
        if (this._ios && value) {
            this._ios.scrollEnabled = !value;
        } else {
            this._ios.scrollEnabled = true;
        }
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
        // This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
        if (!(view.parent instanceof Pager)) {
            this._removeView(view.parent);
        }

        view.parent._removeView(view);
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
                    this.ios.reloadData();
                    this.ios.collectionViewLayout.invalidateLayout();
                    this.ios.layoutIfNeeded();
                }, null);
            }
        }
    }

    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
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
            const width = this._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0);
            const height = this._effectiveItemHeight;
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
            let width = this._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0);
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

@ObjCClass(UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UIScrollViewDelegate)
class UICollectionDelegateImpl extends NSObject
    implements UICollectionViewDelegate, UICollectionViewDelegateFlowLayout, UIScrollViewDelegate {
    _owner: WeakRef<Pager>;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionDelegateImpl {
        const delegate = new UICollectionDelegateImpl();
        delegate._owner = owner;
        delegate.startingScrollingOffset = CGPointMake(0, 0);
        return delegate;
    }

    collectionViewLayoutInsetForSectionAtIndex(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): UIEdgeInsets {
        let owner = this._owner ? this._owner.get() : null;
        if (owner) {
            const peaking = owner.convertToSize(owner.peaking);
            const spacing = owner.convertToSize(owner.spacing);
            const inset = layout.toDeviceIndependentPixels(peaking + spacing);
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
        let width;
        let height;
        if (!owner) return CGSizeZero;
        const peaking = owner.convertToSize(owner.peaking);
        const spacing = owner.convertToSize(owner.spacing);
        width = owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0);
        height = owner._effectiveItemHeight;
        const size = CGSizeMake(
            layout.toDeviceIndependentPixels(width),
            layout.toDeviceIndependentPixels(height)
        );
        owner._measuredMap.set(indexPath.row, size);
        return size;
    }

    public collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView,
                                                           cell: UICollectionViewCell,
                                                           indexPath: NSIndexPath) {
        const owner = this._owner ? this._owner.get() : null;
        if (owner) {
            if (indexPath.row === owner.items.length - 1) {
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

    collectionViewLayoutMinimumLineSpacingForSectionAtIndex(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): number {
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
        let width = layout.toDeviceIndependentPixels(owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0));
        let height = owner._effectiveItemHeight;
        let proportionalOffset = owner.ios.contentOffset.x / width;
        let index = round(proportionalOffset);
        let numberOfItems = owner.items.length;
        return Math.max(0, Math.min(numberOfItems - 1, index));
    }

    indexOfCellBeforeDragging = 0;

    scrollViewWillBeginDragging(scrollView: UIScrollView): void {
        this.startingScrollingOffset = scrollView.contentOffset;
        this.indexOfCellBeforeDragging = this.indexOfMajorCell();

    }

    scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>) {
        let owner = this._owner ? this._owner.get() : null;

        if (!owner) return;

        // Stop scrollView sliding:
        (targetContentOffset as any).value = scrollView.contentOffset;

        // calculate where scrollView should snap to:
        let indexOfMajorCell = this.indexOfMajorCell();

        // calculate conditions:
        let dataSourceCount = owner.items.length;
        let swipeVelocityThreshold = 0.5; // after some trail and error
        let hasEnoughVelocityToSlideToTheNextCell = this.indexOfCellBeforeDragging + 1 < dataSourceCount && velocity.x > swipeVelocityThreshold;
        let hasEnoughVelocityToSlideToThePreviousCell = this.indexOfCellBeforeDragging - 1 >= 0 && velocity.x < -swipeVelocityThreshold;
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
            let width = layout.toDeviceIndependentPixels(owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0));
            let height = owner._effectiveItemHeight;

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
            let indexPath = NSIndexPath.indexPathForItemInSection(snapToIndex, 0);
            owner.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(indexPath, owner.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, true);
        } else {
            this.currentPage = indexOfMajorCell;
            let indexPath = NSIndexPath.indexPathForItemInSection(indexOfMajorCell, 0);
            owner.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(indexPath, owner.orientation === 'vertical' ? UICollectionViewScrollPosition.CenteredVertically : UICollectionViewScrollPosition.CenteredHorizontally, true);
        }

        owner.selectedIndex = this.currentPage;

    }

}


@ObjCClass(UICollectionViewDataSource)
class UICollectionViewDataSourceImpl extends NSObject
    implements UICollectionViewDataSource {
    _owner: WeakRef<Pager>;

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionViewDataSourceImpl {
        const delegate = UICollectionViewDataSourceImpl.new() as UICollectionViewDataSourceImpl;
        delegate._owner = owner;
        return delegate;
    }

    public collectionViewCellForItemAtIndexPath(collectionView: UICollectionView,
                                                indexPath: NSIndexPath): UICollectionViewCell {
        const owner = this._owner ? this._owner.get() : null;
        const template = owner && owner._getItemTemplate(indexPath.row);
        let cell =
            collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(
                template.key,
                indexPath
            ) || PagerCell.initWithEmptyBackground();

        cell.selected = false;
        if (owner) {
            owner._prepareCell(<PagerCell>cell, indexPath);
            const cellView: any = (cell as PagerCell).view;
            let width;
            let height;

            if (cellView && cellView.isLayoutRequired) {
                if (owner._measuredMap && owner._measuredMap.has(indexPath.row)) {
                    const size = owner._measuredMap.get(indexPath.row);
                    width = layout.toDevicePixels(size.width);
                    height = layout.toDevicePixels(size.height);
                } else {
                    const peaking = owner.convertToSize(owner.peaking);
                    const spacing = owner.convertToSize(owner.spacing);
                    width = owner._effectiveItemWidth - (peaking && spacing ? ((2 * peaking) - (4 * spacing) / 3) : 0);
                    height = owner._effectiveItemHeight;
                }
                View.layoutChild(owner, cellView, 0, 0, width, height);
            }
        }

        return cell;
    }


    public collectionViewNumberOfItemsInSection(collectionView: UICollectionView,
                                                section: number): number {
        const owner = this._owner ? this._owner.get() : null;
        return owner && owner.items ? owner.items.length : 0;
    }

    public numberOfSectionsInCollectionView(collectionView: UICollectionView): number {
        return 1;
    }
}


class UICollectionViewFlowLinearLayoutImpl extends UICollectionViewFlowLayout {
    _owner: WeakRef<Pager>;

    previousOffset = 0;
    currentPage = 0;

    /*
        targetContentOffsetForProposedContentOffsetWithScrollingVelocity(proposedContentOffset: CGPoint, velocity: CGPoint): CGPoint {
            let owner = this._owner ? this._owner.get() : null;
            const scrollView = owner.ios;
            const peaking = layout.toDeviceIndependentPixels(owner.convertToSize(owner.peaking));
            const spacing = layout.toDeviceIndependentPixels(owner.convertToSize(owner.spacing));
            let vX = velocity.x;
            let cell = this.collectionView.visibleCells.firstObject;
            if (vX > 0) {
                cell = this.collectionView.visibleCells.lastObject;
            }
            const itemWidth =  layout.toDeviceIndependentPixels(owner._effectiveItemWidth) - (2 * peaking) - (4 * spacing) / 3; // cell.frame.size.width;
            let currentItemIdx = round(this.collectionView.contentOffset.x / itemWidth);

            if (vX > 0) {
                currentItemIdx += 1;
            } else if (vX < 0) {
                currentItemIdx -= 1;
            }

            if (currentItemIdx < 0) {
                currentItemIdx = 0;
            }

            console.log('updated', currentItemIdx);

            let nearestPageOffset = currentItemIdx * itemWidth + (peaking / 2);

            return CGPointMake(nearestPageOffset, proposedContentOffset.y);

        }

        */

    public static initWithOwner(owner: WeakRef<Pager>): UICollectionViewFlowLinearLayoutImpl {
        const layout = UICollectionViewFlowLinearLayoutImpl.new() as UICollectionViewFlowLinearLayoutImpl;
        layout._owner = owner;
        return layout;
    }

    public layoutAttributesForElementsInRect(rect: CGRect) {
        let owner = this._owner ? this._owner.get() : null;
        let visibleLayoutAttributes = super.layoutAttributesForElementsInRect(rect);
        if (owner) {
            if (owner.transformer === 'scale') {
                const count = visibleLayoutAttributes.count;
                for (let i = 0; i < count; i++) {
                    let attributes = visibleLayoutAttributes[i];
                    const frame = attributes.frame;
                    const distance = Math.abs(this.collectionView.contentOffset.x + this.collectionView.contentInset.left - frame.origin.x);
                    const scale = 1.1 * Math.min(Math.max(1 - distance / (this.collectionView.bounds.size.width), .75), 1);
                    attributes.transform = CGAffineTransformMakeScale(1, scale);
                }
            }
        }
        return <any>visibleLayoutAttributes;
    }

    public shouldInvalidateLayoutForBoundsChange(): boolean {
        return true;
    }

}