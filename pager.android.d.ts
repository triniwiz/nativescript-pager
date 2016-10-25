import { StackLayout } from "ui/layouts/stack-layout";
import { Property } from "ui/core/dependency-observable";
export declare class Pager extends StackLayout {
    private _androidViewId;
    private _pagerAdapter;
    private _transformer;
    private _android;
    static selectedIndexProperty: Property;
    constructor();
    readonly android: android.support.v4.view.ViewPager;
    readonly _nativeView: android.support.v4.view.ViewPager;
    readonly pagerAdapter: android.support.v4.view.PagerAdapter;
    transformer: any;
    selectedIndex: number;
    _createUI(): void;
    onLoaded(): void;
    updateIndex(index: number): void;
}
