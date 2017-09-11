// import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
// import { PropertyMetadata } from "ui/core/proxy";
import { View, Property } from "ui/core/view";
import { ContentView } from "ui/content-view"
import * as types from "utils/types";
import * as common from "../common";
import * as app from "application";
import { parse } from "ui/builder";
import { Observable, fromObject } from "data/observable";
global.moduleMerge(common, exports);

function notifyForItemAtIndex(owner, nativeView: any, view: any, eventName: string, index: number) {
    let args = { eventName: eventName, object: owner, index: index, view: view, ios: undefined, android: nativeView };
    owner.notify(args);
    return args;
}

declare namespace com.eftimoff {
    export var viewpagertransformers: any;
}

export class Pager extends common.Pager {
    // Make TypeScript happy
    public pagesCount: number;

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }


    private _android: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _views: Array<any>;
    private _transformer;
    _viewMap: Map<number, View>;

    constructor() {
        super();
        this._viewMap = new Map();
    }

    get views() {
        return this._views;
    }
    set views(value: Array<any>) {
        this._views = value;
    }

    get android() {
        return this._android;
    }

    // get pagesCount() {
    //     return this._getValue(Pager.pagesCountProperty);
    // }
    // set pagesCount(value: number) {
    //     this._setValue(Pager.pagesCountProperty, value);
    // }

    get pagerAdapter() {
        return this._pagerAdapter;
    }

    // get _nativeView() {
    //     return this._android;
    // }

    get _childrenCount(): number {
        return this.items ? this.items.length : 0;
    }

    public createNativeView() : android.support.v4.view.ViewPager {
        const that = new WeakRef(this);
        if (this.disableSwipe) {
            this._android = new TNSViewPager(app.android.context, true); //new android.support.v4.view.ViewPager(this._context);
        } else {
            this._android = new TNSViewPager(app.android.context); //new android.support.v4.view.ViewPager(this._context);
        }
        // this._android.setForegroundGravity(android.view.Gravity.FILL)
        // const lp = new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT)
        // this._android.setLayoutParams(lp);
        this._android.setOnPageChangeListener(new android.support.v4.view.ViewPager.OnPageChangeListener({
            onPageSelected: function (position: number) {
                const owner = that.get();
                if (owner) {
                    owner._selectedIndexUpdatedFromNative(position);
                }
            },
            onPageScrolled: function (position, positionOffset, positionOffsetPixels) {
            },
            onPageScrollStateChanged: function (state) {
            }
        }));


        this._pagerAdapter = new PagerAdapter(this);
        this._android.setAdapter(this._pagerAdapter);

        if (this.transformer) {
            this._android.setPageTransformer(false, new this._transformer());
        }
        if (this.pagesCount > 0) {
            this._android.setOffscreenPageLimit(this.pagesCount);
        }

        this._android.setClipToPadding(false);
        if (this.pageSpacing) {
            this._android.setPageMargin(this.pageSpacing);
        }

        return this._android;
    }

    refresh() {
        if (this._android && this._pagerAdapter) {
            // this._android.setAdapter(this._pagerAdapter);
            this._pagerAdapter.notifyDataSetChanged();
        }
    }
    updatePagesCount(value: number) {
        if (this._android) {
            this._pagerAdapter.notifyDataSetChanged();
            this._android.setOffscreenPageLimit(value);
        }
    }

    updateNativeIndex(oldIndex: number, newIndex: number) {
        // console.log(`Pager.updateNativeIndex ${newIndex}`);
        if (this._android) {
            this._android.setCurrentItem(newIndex);
        }
    }

    updateNativeItems(oldItems: Array<View>, newItems: Array<View>) {
        // console.log(`Pager.updateNativeItems: ${newItems ? newItems.length : 0}`);
        if (oldItems) {
            this._pagerAdapter.notifyDataSetChanged();
        }
        if (newItems) {
            if (this._pagerAdapter) {
                this._pagerAdapter.notifyDataSetChanged();
            }
        }
    }

    onUnloaded() {
        this._viewMap.clear();
        super.onUnloaded();
    }

    eachChildView(callback: (child: View) => boolean): void {
        if (this._viewMap.size > 0) {
            this._viewMap.forEach((view, key) => {
                callback(view);
            });
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

    updateAdapter() {
        this._pagerAdapter.notifyDataSetChanged();
    }

    _selectedIndexUpdatedFromNative(newIndex: number) {
        // console.log(`Pager.selectedIndexUpdatedFromNative -> ${newIndex}`);
        if (this.selectedIndex !== newIndex) {
           // const oldIndex = this.selectedIndex;
            common.selectedIndexProperty.nativeValueChange(this, newIndex);
            // this._onPropertyChangedFromNative(common.Pager.selectedIndexProperty, newIndex);
           // this.notify({ eventName: common.Pager.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
        }
    }
}

export const pagesCountProperty = new Property<Pager, number>({
    name: "pagesCount",
    valueChanged: (pager: Pager, oldValue, newValue) => {
        pager.updatePagesCount(pager.pagesCount);
    }
});
pagesCountProperty.register(Pager);


export class PagerAdapter extends android.support.v4.view.PagerAdapter {
    private owner: Pager;
    constructor(owner) {
        super();
        this.owner = owner;
        return global.__native(this);
    }

    instantiateItem(collection: android.view.ViewGroup, position: number) {
        if (this.owner._viewMap.has(position)) {
            let convertView = this.owner._viewMap.get(position) ? this.owner._viewMap.get(position).nativeView : null;
            if (convertView) {
                collection.addView(convertView);
                return convertView;
            }

        }
        let view: any = !types.isNullOrUndefined(this.owner.itemTemplate) ? parse(this.owner.itemTemplate, this.owner) : null;
        let _args: any = notifyForItemAtIndex(this.owner, view ? view.nativeView : null, view, common.ITEMSLOADING, position)
        view = view || _args.view;
        if (view) {
            view.bindingContext = fromObject(this.owner._getData(position));
            if (!view.parent) {
                this.owner._addView(view);
            }
            this.owner._viewMap.set(position, view);
        }
        view.nativeView.setTag(position);
        collection.addView(view.nativeView);
        return view.nativeView;
    }

    destroyItem(collection: android.view.ViewGroup, position: number, object) {
        if (this.owner._viewMap.has(position)) {
            let convertView: any = this.owner._viewMap.get(position) ? this.owner._viewMap.get(position) : null;
            if (convertView && convertView.nativeView) {
                collection.removeView(convertView.nativeView);
                this.owner._viewMap.delete(position);
            }
        }
    }

    getCount() {
        return this.owner.items ? this.owner.items.length : 0;
    }

    isViewFromObject(view: android.view.View, object) {
        return view === object;
    }
}

export class TNSViewPager extends android.support.v4.view.ViewPager {
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