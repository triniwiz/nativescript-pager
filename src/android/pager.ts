import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
import { View } from "ui/core/view";
import * as common from "../common";
import * as app from "application";
declare var com;
global.moduleMerge(common, exports);
function onSelectedIndexChanged(data: PropertyChangeData) {
    const item = <Pager>data.object;
    item.updateIndex(item.selectedIndex);
}
function onPagesCountChanged(data: PropertyChangeData) {
    const item = <Pager>data.object;
    item.updatePagesCount(item.pagesCount);
}
export class Pager extends common.Pager {
    private _android: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _views: Array<any>;
    private _transformer;
    public static pagesCountProperty = new Property("pagesCount", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.None, onPagesCountChanged));
    constructor() {
        super();
        this.selectedIndex = 0;
    }
    get android() {
        return this._android;
    }
    get pagesCount() {
        return this._getValue(Pager.pagesCountProperty);
    }
    set pagesCount(value: number) {
        this._setValue(Pager.pagesCountProperty, value);
    }
    get _nativeView() {
        return this._android;
    }
    public _createUI() {
        const that = new WeakRef(this);
        if (this.disableSwipe) {
            this._android = new TNSViewPager(app.android.context, true); //new android.support.v4.view.ViewPager(this._context);
        } else {
            this._android = new TNSViewPager(app.android.context); //new android.support.v4.view.ViewPager(this._context);
        }

        this._android.addOnPageChangeListener(new android.support.v4.view.ViewPager.OnPageChangeListener({
            onPageSelected: function (position: number) {
                that.get().selectedIndex = position;
            },
            onPageScrolled: function (position, positionOffset, positionOffsetPixels) {
            },
            onPageScrollStateChanged: function (state) {
            }
        }));
        this._android.setAdapter(this._pagerAdapter);
        if (this.transformer) {
            this._android.setPageTransformer(false, new this._transformer());
        }
        if (this.pagesCount > 0) {
            this._android.setOffscreenPageLimit(this.pagesCount);
        }

        this._android.setClipToPadding(false);
        this._android.setPageMargin(this.pageSpacing);
    }
    public updateIndex(index: number) {
        if (this._android && index) {
            this._android.setCurrentItem(index);
        }
    }
    public updatePagesCount(value: number) {
        if (this._android) {
            this._pagerAdapter.notifyDataSetChanged();
            this._android.setOffscreenPageLimit(value);
        }
    }
    public updateItems(oldItems: Array<View>, newItems: Array<View>) {
        this._pagerAdapter = new PagerAdapter(this);
        this._pagerAdapter.notifyDataSetChanged();
        if (oldItems) {
        }
        if (newItems) {
        }
    }
    get _childrenCount(): number {
        return this.items ? this.items.length : 0;
    }
    public _eachChildView(callback: (child: View) => boolean): void {
        if (this.items) {
            var i;
            var length = this.items.length;
            var retVal: boolean;
            for (i = 0; i < length; i++) {
                retVal = callback(this.items[i]);
                if (retVal === false) {
                    break;
                }
            }
        }
    }

    set transformer(value) {
        switch (value) {
            case "AccordionTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.AccordionTransformer;
                break;
            case "BackgroundToForegroundTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.BackgroundToForegroundTransformer;
                break;
            case "CubeInTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.CubeInTransformer;
                break;
            case "CubeOutTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.CubeOutTransformer;
                break;
            case "DefaultTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.DefaultTransformer;
                break;
            case "DepthPageTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.DepthPageTransformer;
                break;
            case "DrawFromBackTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.DrawFromBackTransformer;
                break;
            case "FlipHorizontalTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.FlipHorizontalTransformer;
                break;
            case "FlipVerticalTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.FlipVerticalTransformer;
                break;
            case "ForegroundToBackgroundTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.ForegroundToBackgroundTransformer;
                break;
            case "RotateDownTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.RotateDownTransformer;
                break;
            case "RotateUpTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.RotateUpTransformer;
                break;
            case "StackTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.StackTransformer;
                break;
            case "TabletTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.TabletTransformer;
                break;
            case "ZoomInTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.ZoomInTransformer;
                break;
            case "ZoomOutSlideTransformer":
                this._transformer = com.eftimoff.viewpagertransformers.ZoomOutSlideTransformer;
                break;
            case "ZoomOutTranformer":
                this._transformer = com.eftimoff.viewpagertransformers.ZoomOutTranformer;
                break;
        }
    }
    get transformer() {
        return this._transformer;
    }
}
class PagerAdapter extends android.support.v4.view.PagerAdapter {
    private owner: Pager;
    private items: Array<any>
    constructor(owner) {
        super();
        this.owner = owner;
        return global.__native(this);
    }

    instantiateItem(collection: android.view.ViewGroup, position: number) {
        const item = this.owner.items[position];
        const nativeView = item._nativeView;
        collection.addView(nativeView);
        return nativeView;
    }

    destroyItem(container: android.view.ViewGroup, position: number, object) {
        const item = this.owner.items[position];
        const nativeView = item._nativeView;
        container.removeView(nativeView);
        this.notifyDataSetChanged();
    }
    getCount(): number {
        return this.owner.items ? this.owner.items.length : 0;
    }
    isViewFromObject(view: android.view.View, object) {
        return view === object;
    }
}
class TNSViewPager extends android.support.v4.view.ViewPager {
    disableSwipe: boolean;
    constructor(context, disableSwipe?: boolean) {
        super(context);
        if (disableSwipe) {
            this.disableSwipe = disableSwipe;
        }
        return global.__native(this);
    }
    onInterceptTouchEvent(ev) {
        if (this.disableSwipe) {
            return false;
        } else {
            return super.onInterceptTouchEvent(ev);
        }
    }
    onTouchEvent(ev) {
        if (this.disableSwipe) {
            return false;
        }
        else {
            return super.onTouchEvent(ev);
        }
    }
}
export class PagerItem extends common.PagerItem {
    constructor() {
        super();
    }
}