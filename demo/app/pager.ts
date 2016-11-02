import { StackLayout } from "ui/layouts/stack-layout";
import { View, AddArrayFromBuilder } from "ui/core/view";
import * as view from "ui/core/view";
import * as utils from "utils/utils";
import { Image } from "ui/image";
import { Label } from "ui/label";
import * as common from "./pager-common";

global.moduleMerge(common, exports);

declare var ADTransitioningDelegate, ADCubeTransition, ADTransitioningViewController;
export class Pager extends common.Pager implements AddArrayFromBuilder {

    private _orientation: UIPageViewControllerNavigationOrientation;
    private _options: NSDictionary<any, any>;
    private _views: Array<any>;
    private _transformer;
    private _ios: UIPageViewController;
    get views() {
        return this._views;
    }
    constructor() {
        super();
        this._views = [];
        const that = new WeakRef(this);
        this._orientation = UIPageViewControllerNavigationOrientation.Horizontal;
        this._transformer = UIPageViewControllerTransitionStyle.Scroll;
        const nsVal = <any>[0.0]
        const nsKey = <any>[UIPageViewControllerOptionInterPageSpacingKey];
        this._options = NSDictionary.dictionaryWithObjectsForKeys(nsKey, nsVal);
        this._ios = UIPageViewController.alloc().initWithTransitionStyleNavigationOrientationOptions(this._transformer, this._orientation, this._options);
        this._ios.dataSource = PagerDataSource.initWithOwner(that);
        this._ios.delegate = PagerViewControllerDelegate.initWithOwner(that);
        this.selectedIndex = 0;
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    get transformer() {
        return this._transformer;
    }
    get ios(): UIView {
        return this._ios.view;
    }
    get _nativeView(): UIView {
        return this._ios.view;
    }

    public updateIndex(index: number) {

    }
    public updateItems(oldItems: Array<View>, newItems: Array<View>) {
        if (oldItems) {
            for (let i = 0, length = oldItems.length; i < length; i++) {
                this._removeView(oldItems[i]);
            }
        }

        if (newItems) {
            let length = newItems.length;
            for (let i = 0; i < length; i++) {
                this._addView(newItems[i]);
            }
        }

        let controller = this.getViewController(this.selectedIndex);
        this._ios.setViewControllersDirectionAnimatedCompletion([controller], UIPageViewControllerNavigationDirection.Forward, false, () => { });
    }
    public runUpdate() {
    }
    public getViewController(selectedIndex: number): UIViewController {
        let vc: PagerView
        while (this.freeViewControllers.length > 0) {
            let controller = this.freeViewControllers.pop().get();
            if (controller) {
                vc = controller;
                break;
            }
        }

        if (!vc) {
            vc = new PagerView();
        }

        vc.owner = new WeakRef(this);
        vc.tag = selectedIndex;
        let view: View;
        if (this.items && selectedIndex < this.items.length) {
            view = this.items[selectedIndex];
        } else {
            let lbl = new Label();
            lbl.text = "Pager.items not set.";
            view = lbl;
        }

        vc.view = view._nativeView;
        this.prepareView(view);
        return vc;
    }

    private widthMeasureSpec: number;
    private heightMeasureSpec: number;

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this.widthMeasureSpec = widthMeasureSpec;
        this.heightMeasureSpec = heightMeasureSpec;
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }
    private left = 0;
    private top = 0;
    private right = 0;
    private bottom = 0;
    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        if (this.items && this.selectedIndex < this.items.length) {
            this.prepareView(this.items[this.selectedIndex]);
        }
    }

    private prepareView(view: View): void {
        View.adjustChildLayoutParams(view, this.widthMeasureSpec, this.heightMeasureSpec);
        let result = View.measureChild(this, view, this.widthMeasureSpec, this.heightMeasureSpec);
        View.layoutChild(this, view, 0, 0, this.right - this.left, this.bottom - this.top);
        View.restoreChildOriginalParams(view);
    }
    
    get _childrenCount(): number {
        return this.items ? this.items.length : 0;
    }

    private _eachChildView(callback) {
        if (!this.items) {
            return;
        }
        for (let i = 0, length = this.items.length; i < length; i++) {
            callback(this.items[i]);
        }
    }

    private freeViewControllers = new Array<WeakRef<PagerView>>();

    addReusableViewController(controller: PagerView): void {
        this.freeViewControllers.push(new WeakRef(controller));
        controller.tag = undefined;
        controller.view = undefined;
        controller.owner = undefined;
    }
}

class PagerViewControllerDelegate extends NSObject implements UIPageViewControllerDelegate {
    public static ObjCProtocols = [UIPageViewControllerDelegate];
    private _owner: WeakRef<Pager>;
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
            let pos = vc.tag;
            this.owner.selectedIndex = pos;
        }
    }
}
class PagerDataSource extends NSObject implements UIPageViewControllerDataSource {
    public static ObjCProtocols = [UIPageViewControllerDataSource];
    private _owner: WeakRef<Pager>;
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
        if (pos === 0) {
            return null;
        } else {
            let prev = pos - 1;
            return this.owner.getViewController(prev);
        }
    }
    pageViewControllerViewControllerAfterViewController(pageViewController: UIPageViewController, viewControllerAfter: UIViewController): UIViewController {
        let pos = (<PagerView>viewControllerAfter).tag;
        let count = this.presentationCountForPageViewController(pageViewController);
        if (pos === count - 1) {
            return null;
        } else {
            return this.owner.getViewController(pos + 1);
        }

    }
    presentationCountForPageViewController(pageViewController: UIPageViewController): number {
        if (!this.owner || !this.owner.items) {
            return 0;
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
    public owner: WeakRef<Pager>;
    public tag: number;

    didMoveToParentViewController(parent: UIViewController): void {
        let owner = this.owner.get();
        if (!parent && owner) {
            owner.addReusableViewController(this);
        }
    }
}