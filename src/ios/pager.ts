import { PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
import { View, AddArrayFromBuilder } from "ui/core/view";
import { Label } from "ui/label";
import { Color } from 'color';
import * as utils from "utils/utils";
import * as types from "utils/types";
import * as common from "../common";
import { parse } from "ui/builder";
import { Observable } from "data/observable";
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
    private _views: any[];
    private _transformer;
    private _ios: UIPageViewController;
    _viewMap: Map<any, any>;
    private widthMeasureSpec: number;
    private heightMeasureSpec: number;
    private left = 0;
    private top = 0;
    private right = 0;
    private bottom = 0;
    private cachedViewControllers: WeakRef<PagerView>[] = [];
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;

    constructor() {
        super();
        this._views = [];
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
        const sv = this._nativeView.subviews[1];
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

    get views() {
        return this._views;
    }

    set views(value: any[]) {
        this._views = value;
    }

    get transformer() {
        return this._transformer;
    }

    get ios() {
        return this._ios;
    }

    get _nativeView(): UIView {
        return this._ios.view;
    }

    get _childrenCount(): number {
        return this.items ? this.items.length : 0;
    }

    updateNativeIndex(oldIndex: number, newIndex: number) {
        // console.log(`Pager.updateNativeIndex: ${oldIndex} -> ${newIndex}`);
        this._navigateNativeViewPagerToIndex(oldIndex, newIndex);
    }

    updateNativeItems(oldItems: View[], newItems: View[]) {
        // console.log(`Pager.updateNativeItems: ${newItems ? newItems.length : 0}`);
        if (oldItems) {
            this.cachedViewControllers = [];
        }
        if (newItems.length > 0) {
            // re-init
            this._initNativeViewPager();
        }
    }

    runUpdate() { }

    refresh(){}

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
        }
        let view: any;
        if (this.items && this.items.length) {
            // if (this._viewMap.has(selectedIndex)) {
            //     view = this._viewMap.get(selectedIndex);
            // } else {
            //     view = !types.isNullOrUndefined(this.itemTemplate) ? parse(this.itemTemplate, this) : null;
            // }

            view = !types.isNullOrUndefined(this.itemTemplate) ? parse(this.itemTemplate, this) : null;
            let _args: any = notifyForItemAtIndex(this, view ? view._nativeView : null, view, common.ITEMSLOADING, selectedIndex);
            view = view || _args.view;

            if (view) {
                let item = (typeof this.items.getItem === "function") ? this.items.getItem(selectedIndex) : this.items[selectedIndex];
                view.bindingContext = new Observable(item);
            }

        } else {
            let lbl = new Label();
            lbl.text = "Pager.items not set.";
            view = lbl;
        }
        this.prepareView(view);
        vc.view = view._nativeView;

        return vc;
    }

    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // console.log(`Pager.onMeasure: ${widthMeasureSpec}x${heightMeasureSpec}`);
        this.widthMeasureSpec = widthMeasureSpec;
        this.heightMeasureSpec = heightMeasureSpec;
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }


    onLayout(left: number, top: number, right: number, bottom: number): void {
        // console.log(`Pager.onLayout ${left}, ${top}, ${right}, ${bottom}`);
        super.onLayout(left, top, right, bottom);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        if (this._viewMap && this._viewMap.size > 0) {
            this._viewMap.forEach((item) => {
                this.prepareView(item);
            });
            this._initNativeViewPager();
        }
    }

    onLoaded() {
        // console.log(`Pager.ios.onLoaded`);
    }

    onUnloaded() {
        // console.log(`Pager.ios.onUnloaded`);
        this._ios.delegate = null;
        this._ios = null;
        this.cachedViewControllers = null;
        super.onUnloaded();
    }

    _selectedIndexUpdatedFromNative(newIndex: number) {
        // console.log(`Pager.updateSelectedIndexFromNative: -> ${newIndex}`);
        const oldIndex = this.selectedIndex;
        this._onPropertyChangedFromNative(common.Pager.selectedIndexProperty, newIndex);
        this.notify({ eventName: common.Pager.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
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
        this._ios.setViewControllersDirectionAnimatedCompletion(<any>[controller], UIPageViewControllerNavigationDirection.Forward, false, () => { });
    }

    private _navigateNativeViewPagerToIndex(fromIndex: number, toIndex: number) {
        const vc = this.getViewController(toIndex);
        if (!vc) throw new Error('no VC');
        // console.log(`Pager._navigateNativeViewPagerToIndex: ${toIndex}`);
        const direction = fromIndex < toIndex ?
            UIPageViewControllerNavigationDirection.Forward : UIPageViewControllerNavigationDirection.Reverse;
        this._ios.setViewControllersDirectionAnimatedCompletion(NSArray.arrayWithObject(vc), direction, true, () => { });
    }

    private prepareView(view: View): void {
        View.adjustChildLayoutParams(view, this.widthMeasureSpec, this.heightMeasureSpec);
        let result = View.measureChild(this, view, this.widthMeasureSpec, this.heightMeasureSpec);
        View.layoutChild(this, view, 0, 0, result.measuredWidth, result.measuredHeight);
        // console.log(`Pager.prepareView - measureChild = (${result.measuredWidth}x${result.measuredHeight})`);
        // console.log(`Pager.prepareView - layout: ${this.left}, ${this.top}, ${this.right}, ${this.bottom}`);
        View.restoreChildOriginalParams(view);

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

export class PagerItem extends common.PagerItem {

    private _ios: UIView;

    constructor() {
        super();
        this._ios = UIView.new();
    }

    get ios() {
        return this._ios;
    }

    get _nativeView() {
        return this._ios;
    }

}