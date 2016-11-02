import { StackLayout } from "ui/layouts/stack-layout";
import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
import { View } from "ui/core/view";
function onSelectedIndexChanged(data: PropertyChangeData) {
    const item = <Pager>data.object;
    item.updateIndex(item.selectedIndex);
}
export class Pager extends StackLayout {
    private _transformer;
    private _ios: UIPageViewController;
    private _disableSwipe: boolean;
    public static selectedIndexProperty = new Property("selectedIndex", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.None));
    constructor() {
        super();
    }
    get disableSwipe(): boolean {
        return this._disableSwipe;
    }
    set disableSwipe(value: boolean) {
        this._disableSwipe = value;
    }
    get ios() {
        return this._ios;
    }
    get _nativeView() {
        return this._ios;
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

    onLoaded() {
        super.onLoaded();
        const that = new WeakRef(this);
        //this._ios = UIPageViewController.alloc().ini
        //this._ios.
    }
    updateIndex(index: number) {

    }
    runUpdate() {
    }

}
Pager.selectedIndexProperty.onValueChanged = onSelectedIndexChanged;