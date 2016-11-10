import { View } from "ui/core/view";
import * as common from "../common";
export declare class Pager extends common.Pager {
    private _orientation;
    private _options;
    private _views;
    private _transformer;
    private _ios;
    views: Array<any>;
    constructor();
    readonly transformer: any;
    readonly ios: UIPageViewController;
    readonly _nativeView: UIView;
    updateIndex(index: number): void;
    updateItems(oldItems: Array<View>, newItems: Array<View>): void;
    runUpdate(): void;
    getViewController(selectedIndex: number): UIViewController;
    private widthMeasureSpec;
    private heightMeasureSpec;
    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
    private left;
    private top;
    private right;
    private bottom;
    onLayout(left: number, top: number, right: number, bottom: number): void;
    private prepareView(view);
    readonly _childrenCount: number;
    private _eachChildView(callback);
    private freeViewControllers;
    addReusableViewController(controller: PagerView): void;
}
export declare class PagerView extends UIViewController {
    owner: WeakRef<Pager>;
    tag: number;
    didMoveToParentViewController(parent: UIViewController): void;
}
export declare class PagerItem extends common.PagerItem {
    private _ios;
    readonly ios: UIView;
    readonly _nativeView: UIView;
    constructor();
}
