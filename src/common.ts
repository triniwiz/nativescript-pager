import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
import { View, AddArrayFromBuilder } from "ui/core/view";
import { ContentView } from "ui/content-view";
import * as types from "utils/types";

export module knownCollections {
    export const items = "items";
}

function onItemsChanged(data: PropertyChangeData) {
    const pager = <Pager>data.object;
    if (data.newValue) {
        pager.updateNativeItems(<Array<View>>data.oldValue, <Array<View>>data.newValue);
    }
}

function onSelectedIndexChanged(data: PropertyChangeData) {
    const pager = <Pager>data.object;
    if (pager && pager.items && types.isNumber(data.newValue)) {
        pager.updateNativeIndex(data.oldValue, data.newValue);
        pager.notify({ eventName: Pager.selectedIndexChangedEvent, object: pager, oldIndex: data.oldValue, newIndex: data.newValue });
    }
}

export abstract class Pager extends View implements AddArrayFromBuilder {
    private _disableSwipe: boolean;
    private _pageSpacing: number = 0;
    public static selectedIndexProperty = new Property("selectedIndex", "Pager", new PropertyMetadata(0, PropertyMetadataSettings.None, null, null, onSelectedIndexChanged));
    public static itemsProperty = new Property("items", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsLayout, null, null, onItemsChanged));
    public static showNativePageIndicatorProperty = new Property("showNativePageIndicator", "Pager", new PropertyMetadata(false));
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }
    get items() {
        return this._getValue(Pager.itemsProperty);
    }
    set items(value: Array<any>) {
        this._setValue(Pager.itemsProperty, value);
    }
    get selectedIndex() {
        return this._getValue(Pager.selectedIndexProperty);
    }
    set selectedIndex(newVal: number | any) {
        if (types.isNumber(newVal)) {
            newVal = Math.max(0, newVal);
            if (this.items) {
                newVal = Math.min(this.items.length - 1, newVal);
            }
            this._setValue(Pager.selectedIndexProperty, newVal);
        } else {
            throw new Error("invalid selectedIndex, should be between [0, " + (this.items.length - 1) + "]");
        }
    }
    get disableSwipe(): boolean {
        return this._disableSwipe;
    }
    set disableSwipe(value: boolean) {
        this._disableSwipe = value;
    }
    get pageSpacing() {
        return this._pageSpacing;
    }
    set pageSpacing(value: number) {
        this._pageSpacing = value;
    }
    get showNativePageIndicator() {
        return this._getValue(Pager.showNativePageIndicatorProperty);
    }
    set showNativePageIndicator(value: boolean) {
        this._setValue(Pager.showNativePageIndicatorProperty, value);
    }
    public abstract updateNativeItems(oldItems: Array<View>, newItems: Array<View>): void;

    public abstract updateNativeIndex(oldIndex: number, newIndex: number): void;
}

export abstract class PagerItem extends View { }