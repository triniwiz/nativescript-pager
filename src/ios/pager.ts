import {View, AddArrayFromBuilder} from "ui/core/view";
import * as utils from "utils/utils";
import {Label} from "ui/label";
import {Color} from 'color';
import * as colors from 'color/known-colors';
import * as common from "../common";
global.moduleMerge(common, exports);

declare var ADTransitioningDelegate,
    ADCubeTransition,
    ADTransitioningViewController;

export class Pager extends common.Pager {

    private _orientation: UIPageViewControllerNavigationOrientation;
    private _options: NSDictionary<any, any>;
    private _views: any[];
    private _transformer;
    private _ios: UIPageViewController;

    private widthMeasureSpec: number;
    private heightMeasureSpec: number;

    private left = 0;
    private top = 0;
    private right = 0;
    private bottom = 0;

    private freeViewControllers = new Array<WeakRef<PagerView>>();

    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundColor: any;
    private initView: boolean = false;

    constructor() {
        super();
        this._views = [];
        const that = new WeakRef(this);
        this._orientation = UIPageViewControllerNavigationOrientation.Horizontal;
        this._transformer = UIPageViewControllerTransitionStyle.Scroll;
        const nsVal = <any>[0.0];
        const nsKey = <any>[UIPageViewControllerOptionInterPageSpacingKey];
        this._options = NSDictionary.dictionaryWithObjectsForKeys(nsKey, nsVal);
        this._ios = UIPageViewController.alloc().initWithTransitionStyleNavigationOrientationOptions(this._transformer, this._orientation, this._options);
        this._ios.dataSource = PagerDataSource.initWithOwner(that);
        this._ios.delegate = PagerViewControllerDelegate.initWithOwner(that);
        const pc = this._nativeView.subviews[0];
        pc.hidden = true;
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
        // this._ios.view.sendSubviewToBack(pc)
        // this._ios.view.frame = CGRectMake(0, 0, utils.ios.getter(UIScreen, UIScreen.mainScreen.bounds).size.width, utils.ios.getter(UIScreen, UIScreen.mainScreen.bounds).size.height - 300);
        // sv.frame = CGRectMake(0, 0, sv.frame.size.width, sv.frame.size.height);
        // sv.setNeedsLayout();
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

    updateIndex(index: number) {
        if (!this.initView) {
            let controller = this.getViewController(this.selectedIndex);
            this._ios.setViewControllersDirectionAnimatedCompletion(<any>[controller], UIPageViewControllerNavigationDirection.Forward, false, () => {
            });
            this.initView = true;
        }
    }

    updateItems(oldItems: View[], newItems: View[]) {}

    runUpdate() {}

    getViewController(selectedIndex: number): UIViewController {

        let vc: PagerView;
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
        let view: View;
        vc.owner = new WeakRef(this);
        vc.tag = selectedIndex;
        if (this.items && this.items.length) {
            view = this.items[selectedIndex];
        } else {
            let lbl = new Label();
            lbl.text = "Pager.items not set.";
            view = lbl;
        }
        vc.view = view.ios;
        this.prepareView(view);
        return vc;

    }

    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this.widthMeasureSpec = widthMeasureSpec;
        this.heightMeasureSpec = heightMeasureSpec;
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

    onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        if (this.items && this.selectedIndex < this.items.length) {
            this.prepareView(this.items[this.selectedIndex]);
        }
    }

    addReusableViewController(controller: PagerView): void {
        this.freeViewControllers.push(new WeakRef(controller));
        controller.tag = undefined;
        controller.view = undefined;
        controller.owner = undefined;
    }

    get _childrenCount(): number {
        return this.items ? this.items.length : 0;
    }

    private prepareView(view: View): void {
        View.adjustChildLayoutParams(view, this.widthMeasureSpec, this.heightMeasureSpec);
        let result = View.measureChild(this, view, this.widthMeasureSpec, this.heightMeasureSpec);
        View.layoutChild(this, view, 0, 0, this.right - this.left, this.bottom - this.top);
        View.restoreChildOriginalParams(view);
    }

    private _eachChildView(callback) {
        if (!this.items) {
            return;
        }
        for (let i = 0, length = this.items.length; i < length; i++) {
            callback(this.items[i]);
        }
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
            this.owner.selectedIndex = vc.tag;
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

    owner: WeakRef<Pager>;
    tag: number;

    public static initWithOwner(owner: WeakRef<Pager>) {
        const pv = new PagerView();
        pv.owner = owner;
        return pv;
    }

    didMoveToParentViewController(parent: UIViewController): void {
        let owner = this.owner.get();
        if (!parent && owner) {
            owner.addReusableViewController(this);
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