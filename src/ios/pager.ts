import { PropertyChangeData } from "ui/core/dependency-observable";
import { View, layout } from "ui/core/view";
import { Label } from "ui/label";
import { Color } from 'color';
import * as types from "utils/types";
import * as common from "../common";
import { parse } from "ui/builder";
import { Observable, fromObject } from "data/observable";
import { ObservableArray } from "data/observable-array";

function notifyForItemAtIndex(owner, nativeView: any, view: any, eventName: string, index: number) {
    let args = { eventName: eventName, object: owner, index: index, view: view, ios: nativeView, android: undefined };
    owner.notify(args);
    return args;
}

global.moduleMerge(common, exports);

declare var ADTransitioningDelegate,
    ADCubeTransition,
    ADTransitioningViewController;

export class Pager extends common.Pager {
    public itemTemplateUpdated(oldData: any, newData: any): void {
    }
    private _orientation: UIPageViewControllerNavigationOrientation;
    private _options: NSDictionary<any, any>;
    private _transformer;
    private _ios: UIPageViewController;
    private widthMeasureSpec: number;
    private heightMeasureSpec: number;
    private layoutWidth = 0;
    private layoutHeight = 0;
    private _viewMap: Map<number, View>;
    private cachedViewControllers: WeakRef<PagerView>[] = [];
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;

    constructor() {
        super();
        this._viewMap = new Map();
        const that = new WeakRef(this);
        this._orientation = UIPageViewControllerNavigationOrientation.Horizontal;
        this._transformer = UIPageViewControllerTransitionStyle.Scroll;
        const nsVal = <any>[0.0];
        const nsKey = <any>[UIPageViewControllerOptionInterPageSpacingKey];
        this._options = NSDictionary.dictionaryWithObjectsForKeys(nsKey, nsVal);
        this._ios = UIPageViewController.alloc().initWithTransitionStyleNavigationOrientationOptions(this._transformer, this._orientation, this._options);
        this._ios.dataSource = PagerDataSource.initWithOwner(that);
        this._ios.delegate = PagerViewControllerDelegate.initWithOwner(that);
        this.nativeView = this._ios.view;
        const sv = this.nativeView.subviews[1];

        if (this.borderRadius) {
            sv.layer.cornerRadius = this.borderRadius;
        }
        if (this.borderColor) {
            sv.layer.borderColor = new Color(this.borderColor).ios.CGColor;
        }
        if (this.backgroundColor) {
            sv.layer.backgroundColor = new Color(this.backgroundColor).ios.CGColor;
        }
        if (this.borderWidth) {
            sv.layer.borderWidth = this.borderWidth;
        }
    }

    get transformer() {
        return this._transformer;
    }

    eachChildView(callback: (child: View) => boolean): void {
        if (this._viewMap.size > 0) {
            this._viewMap.forEach((view, key) => {
                callback(view);
            });
        }
    }

    updateNativeIndex(oldIndex: number, newIndex: number) {
        // console.log(`Pager.updateNativeIndex: ${oldIndex} -> ${newIndex}`);
        this._navigateNativeViewPagerToIndex(oldIndex, newIndex);
    }

    updateNativeItems(oldItems: View[], newItems: View[]) {
        // console.log(`Pager.updateNativeItems: ${newItems ? newItems.length : 0}`);
        if (oldItems) {
            this._clearCachedItems();
        }
        if (newItems.length > 0) {
            // re-init
            this._initNativeViewPager();
        }
    }

    refresh() { }

    getViewController(selectedIndex: number): UIViewController {
        // console.log(`Pager.getViewController: ${selectedIndex}`);
        let vc: PagerView;
        if (this.cachedViewControllers[selectedIndex]) {
            // console.log(`- got PagerView from cache`);
            vc = this.cachedViewControllers[selectedIndex].get();
        }
        if (!vc) {
            // console.log(`- created new PagerView`);
            vc = PagerView.initWithOwnerTag(new WeakRef(this), selectedIndex);
            this.cachedViewControllers[selectedIndex] = new WeakRef(vc);
            let view: View;
            if (this.items && this.items.length) {
                // if (this._viewMap.has(selectedIndex)) {
                //     view = this._viewMap.get(selectedIndex);
                // } else {
                //     view = !types.isNullOrUndefined(this.itemTemplate) ? parse(this.itemTemplate, this) : null;
                // }

                view = !types.isNullOrUndefined(this.itemTemplate) ? parse(this.itemTemplate, this) : null;
                let _args: any = notifyForItemAtIndex(this, view ? view.nativeView : null, view, common.ITEMSLOADING, selectedIndex);
                view = view || _args.view;

                if (view) {
                    let item = (typeof this.items.getItem === "function") ? this.items.getItem(selectedIndex) : this.items[selectedIndex];
                    view.bindingContext = fromObject(item);
                }
            } else {
                let lbl = new Label();
                lbl.text = "Pager.items not set.";
                view = lbl;
            }
            this._viewMap.set(selectedIndex, view);

            // console.log(`Pager._addView for index: ${selectedIndex}`);
            this._addView(view);

            vc.view.addSubview(view.nativeView);
            this.prepareView(view);
        }

        return vc;
    }

    private prepareView(view: View): void {
        // console.log(`Pager.prepareView`);
        if (this.widthMeasureSpec !== undefined && this.heightMeasureSpec != undefined) {
            let result = View.measureChild(this, view, this.widthMeasureSpec, this.heightMeasureSpec);
            View.layoutChild(this, view, 0, 0, this.layoutWidth, this.layoutHeight);
            // console.log(`Pager.prepareView - measureChild = (${result.measuredWidth}x${result.measuredHeight})`);
            // console.log(`Pager.prepareView - layout: 0, 0, ${this.layoutWidth}, ${this.layoutHeight}`);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // console.log(`Pager.onMeasure: ${widthMeasureSpec}x${heightMeasureSpec}`)
        this.widthMeasureSpec = widthMeasureSpec;
        this.heightMeasureSpec = heightMeasureSpec;

        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const view = this._viewMap.get(this.selectedIndex);
        let { measuredWidth, measuredHeight } = View.measureChild(this, view, widthMeasureSpec, heightMeasureSpec);
        // console.log(`Pager.onMeasure - measureChild = (${measuredWidth}x${measuredHeight})`);

        // Check against our minimum sizes
        measuredWidth = Math.max(measuredWidth, this.effectiveMinWidth);
        measuredHeight = Math.max(measuredHeight, this.effectiveMinHeight);

        const widthAndState = View.resolveSizeAndState(measuredWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        // console.log(`Pager.onLayout ${left}, ${top}, ${right}, ${bottom}`);
        super.onLayout(left, top, right, bottom);
        this.layoutWidth = right - left;
        this.layoutHeight = bottom - top;

        const view = this._viewMap.get(this.selectedIndex);
        View.layoutChild(this, view, 0, 0, this.layoutWidth, this.layoutHeight);
    }

    disposeNativeView() {
        // console.log(`Pager.ios.disposeNativeView`);
        this._clearCachedItems();
        this._ios.delegate = null;
        this._ios = null;
        super.disposeNativeView();
    }

    private _clearCachedItems() {
        if (!this.cachedViewControllers) {
            return
        }

        this.cachedViewControllers.forEach(vcRef => {
            vcRef.clear();
        });

        this._viewMap.forEach((val, key) => {
            if (val && val.parent === this) {
                this._removeView(val);
            }
        })
        this._viewMap.clear();
    }

    _selectedIndexUpdatedFromNative(newIndex: number) {
        // console.log(`Pager.updateSelectedIndexFromNative: -> ${newIndex}`);
       // const oldIndex = this.selectedIndex;

        //this._onPropertyChangedFromNative(common.Pager.selectedIndexProperty, newIndex);
        common.selectedIndexProperty.nativeValueChange(this, newIndex);

       // this.notify({ eventName: common.Pager.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
    }

    _viewControllerRemovedFromParent(controller: PagerView): void {
        // console.log(`Pager.viewControllerRemovedFromParent ${controller.tag}`);
        // this.freeViewControllers.push(new WeakRef(controller));
        // controller.tag = undefined;
        // controller.view = undefined;
        // controller.owner = undefined;
    }

    private _initNativeViewPager() {
        let controller = this.getViewController(this.selectedIndex);
        this._ios.setViewControllersDirectionAnimatedCompletion(NSArray.arrayWithObject(controller), UIPageViewControllerNavigationDirection.Forward, false, () => { });
    }

    private _navigateNativeViewPagerToIndex(fromIndex: number, toIndex: number) {
        const vc = this.getViewController(toIndex);
        if (!vc) throw new Error('no VC');
        // console.log(`Pager._navigateNativeViewPagerToIndex: ${toIndex}`);
        const direction = fromIndex < toIndex ?
            UIPageViewControllerNavigationDirection.Forward : UIPageViewControllerNavigationDirection.Reverse;
        this._ios.setViewControllersDirectionAnimatedCompletion(NSArray.arrayWithObject(vc), direction, true, () => { });
    }

}

class PagerViewControllerDelegate extends NSObject implements UIPageViewControllerDelegate {

    private _owner: WeakRef<Pager>;

    public static ObjCProtocols = [UIPageViewControllerDelegate];

    get owner(): Pager {
        return this._owner.get();
    }

    public static initWithOwner(owner: WeakRef<Pager>): PagerViewControllerDelegate {
        let pv = new PagerViewControllerDelegate();
        pv._owner = owner;
        return pv;
    }

    pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted(pageViewController: UIPageViewController, finished: boolean, previousViewControllers: NSArray<any>, completed: boolean) {
        // console.log("pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted: " + finished)
        if (finished) {
            let vc = <PagerView>pageViewController.viewControllers[0];
            const owner = this.owner;
            if (owner) {
                owner._selectedIndexUpdatedFromNative(vc.tag);
            }
        }
    }
}
class PagerDataSource extends NSObject implements UIPageViewControllerDataSource {

    private _owner: WeakRef<Pager>;

    public static ObjCProtocols = [UIPageViewControllerDataSource];

    get owner(): Pager {
        return this._owner.get();
    }

    public static initWithOwner(owner: WeakRef<Pager>): PagerDataSource {
        let ds = new PagerDataSource();
        ds._owner = owner;
        return ds;
    }

    pageViewControllerViewControllerBeforeViewController(pageViewController: UIPageViewController, viewControllerBefore: UIViewController): UIViewController {
        let pos = (<PagerView>viewControllerBefore).tag;
        if (pos === 0 || !this.owner || !this.owner.items) {
            return null;
        } else {
            let prev = pos - 1;
            return this.owner.getViewController(prev);
        }
    }

    pageViewControllerViewControllerAfterViewController(pageViewController: UIPageViewController, viewControllerAfter: UIViewController): UIViewController {
        let pos = (<PagerView>viewControllerAfter).tag;
        if (!this.owner || !this.owner.items || this.owner.items.length - 1 === pos) {
            return null;
        } else {
            return this.owner.getViewController(pos + 1);
        }
    }

    presentationCountForPageViewController(pageViewController: UIPageViewController): number {
        // console.log("presentationCountForPageViewController: " + this.owner.showNativePageIndicator)
        if (!this.owner || !this.owner.items || !this.owner.showNativePageIndicator) {
            // Hide the native UIPageControl (dots)
            return -1;
        }
        return this.owner.items.length;
    }

    presentationIndexForPageViewController(pageViewController: UIPageViewController): number {
        if (!this.owner || !this.owner.items) {
            return -1;
        }
        return this.owner.selectedIndex;
    }
}

export class PagerView extends UIViewController {

    owner: WeakRef<Pager>;
    tag: number;

    public static initWithOwnerTag(owner: WeakRef<Pager>, tag: number): PagerView {
        let pv = new PagerView(null);
        pv.owner = owner;
        pv.tag = tag;
        return pv;
    }

    didMoveToParentViewController(parent: UIViewController): void {
        // console.log(`PagerView.didMoveToParentViewController`);
        let owner = this.owner.get();
        if (!parent && owner) {
            // removed from parent
            owner._viewControllerRemovedFromParent(this);
        }
    }
}