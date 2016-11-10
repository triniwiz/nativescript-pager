import { Property } from "ui/core/dependency-observable";
import { View } from "ui/core/view";
import * as common from "../common";
export declare class Pager extends common.Pager {
    private _android;
    private _pagerAdapter;
    private _views;
    private _transformer;
    static pagesCountProperty: Property;
    constructor();
    readonly android: android.support.v4.view.ViewPager;
    pagesCount: number;
    readonly _nativeView: android.support.v4.view.ViewPager;
    _createUI(): void;
    updateIndex(index: number): void;
    updatePagesCount(value: number): void;
    updateItems(oldItems: Array<View>, newItems: Array<View>): void;
    readonly _childrenCount: number;
    _eachChildView(callback: (child: View) => boolean): void;
    transformer: any;
}
export declare class PagerItem extends common.PagerItem {
    constructor();
}
