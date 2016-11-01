import { StackLayout } from "ui/layouts/stack-layout";
import { View, AddArrayFromBuilder } from "ui/core/view";
import * as view from "ui/core/view";
import * as utils from "utils/utils";
import { Image } from "ui/image";
import * as common from "./pager-common";
declare var ADTransitioningDelegate, ADCubeTransition, ADTransitioningViewController;
global.moduleMerge(common, exports);
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

    public onLoaded() {
        super.onLoaded();
        if (!this.selectedIndex) {
            this.selectedIndex = 0;
        }
        const that = new WeakRef(this);
        this._ios.dataSource = PagerDataSource.initWithOwner(that);
        this._ios.delegate = PagerViewControllerDelegate.initWithOwner(that);
        let controller = this.addViewController(this.selectedIndex);
        let dir = UIPageViewControllerNavigationDirection.Forward;
        this._ios.setViewControllersDirectionAnimatedCompletion(<any>[controller], dir, false, () => { });

    }

    public updateIndex(index: number) {

    }
    public updateItems(val) { }
    public runUpdate() {
    }
    public addViewController(selectedIndex: number): UIViewController {
        const that = new WeakRef(this);
        return this.items[selectedIndex].ios.nextResponder;
       // let vc: PagerView = new PagerView();
       // vc.tag = selectedIndex;
       // vc.owner = that.get();
        //vc.view.addSubview(this.items[selectedIndex].ios)
       // vc.view.addSubview(item);
       // return vc;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        
      //  View.adjustChildLayoutParams(this.items[this.selectedIndex], widthMeasureSpec, heightMeasureSpec);

        var result = View.measureChild(this, this.items[this.selectedIndex], widthMeasureSpec, heightMeasureSpec);

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();
        var measureWidth = Math.max(result.measuredWidth, this.minWidth * density);
        var measureHeight = Math.max(result.measuredHeight, this.minHeight * density);

        var widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }
    public onLayout(left: number, top: number, right: number, bottom: number): void {
        View.layoutChild(this, this.items[this.selectedIndex], 0, 0, right - left, bottom - top);

      //  View.restoreChildOriginalParams(this.items[this.selectedIndex]);
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
        let vc = <PagerView>viewControllerBefore;
        let pos = vc.tag;
        if (pos === 0) {
            return null;
        } else {
            let prev = pos - 1;
            return this.owner.addViewController(prev);
            //return this.owner.items[prev].ios;
        }
    }
    pageViewControllerViewControllerAfterViewController(pageViewController: UIPageViewController, viewControllerAfter: UIViewController): UIViewController {
        let vc = <PagerView>viewControllerAfter;
        let pos = vc.tag;
        let count = this.presentationCountForPageViewController(pageViewController);
        if (pos === count - 1) {
            return null;
        } else {
            let next = pos += 1;
           // console.log(this.owner.items[next].ios.view)
           // return this.owner.items[next].ios.view;
             return this.owner.addViewController(next);
        }

    }
    presentationCountForPageViewController(pageViewController: UIPageViewController): number {
        if (!this.owner) {
            return 0;
        }
        return this.owner.items.length;
    }
    presentationIndexForPageViewController(pageViewController: UIPageViewController): number {
        return this.owner.selectedIndex;
    }
}

export class PagerView extends UIViewController {
    public owner: any;
    public tag: number;
    public viewDidLoad() {
        super.viewDidLoad();
        if (this.owner) {
            this.owner.onLoaded();
        }
    }
    // public viewDidLayoutSubviews(): void {
    //     if (this.owner) {
    //        // var width = this.view.frame.size.width;
    //        // var height = this.view.frame.size.height;
    //        var width = 500;
    //        var height = 500;
    //         this.owner.measure(width, height);
    //         this.owner.layout(0, 0, width, height);
    //     }
    // }
}
