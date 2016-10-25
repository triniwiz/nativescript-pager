import { StackLayout } from "ui/layouts/stack-layout";
import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
declare var com;
function onSelectedIndexChanged(data: PropertyChangeData) {
    const item = <Pager>data.object;
    item.updateIndex(item.selectedIndex);
}
export class Pager extends StackLayout {
    private _androidViewId: number;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _transformer;
    private _android: android.support.v4.view.ViewPager;
    public static selectedIndexProperty = new Property("selectedIndex", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.None));
    constructor() {
        super();
    }
    get android() {
        return this._android;
    }
    get _nativeView() {
        return this._android;
    }
    get pagerAdapter() {
        return this._pagerAdapter;
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
    get selectedIndex() {
        return this._getValue(Pager.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(Pager.selectedIndexProperty, value);
    }
    _createUI() {
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        };
        this._android = new android.support.v4.view.ViewPager(this._context);
        this._android.setId(this._androidViewId);
    }

    onLoaded() {
        super.onLoaded();
        const that = new WeakRef(this);
        this._android.setOffscreenPageLimit(this._android.getChildCount());
        this._pagerAdapter = new PagerAdapter(this);
        this._android.setOnPageChangeListener(new android.support.v4.view.ViewPager.OnPageChangeListener({
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
        if (this.selectedIndex) {
            this._android.setCurrentItem(this.selectedIndex);
        }
    }

    updateIndex(index: number) {
        if (this._android && index) {
            this._android.setCurrentItem(index);
        }
    }
}
Pager.selectedIndexProperty.onValueChanged = onSelectedIndexChanged;
class PagerAdapter extends android.support.v4.view.PagerAdapter {
    private owner: Pager;
    constructor(owner) {
        super();
        this.owner = owner;
        return global.__native(this);
    }

    instantiateItem(collection: android.view.ViewGroup, position: number) {
        if (position <= this.owner.android.getChildCount() - 1) {
            const view = this.owner.android.getChildAt(position);
            collection.removeView(this.owner.android.getChildAt(position));
            collection.addView(view, position);
            this.owner.pagerAdapter.notifyDataSetChanged();
            return view;
        }

    }

    destroyItem(container: android.view.ViewGroup, position: number, object) {
        container.removeView(object);
    }
    getCount(): number {
        return this.owner.android.getChildCount();
    }
    isViewFromObject(view: android.view.View, object) {
        return view == object;
    }
}