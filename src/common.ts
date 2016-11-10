import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
import { PropertyMetadata } from "ui/core/proxy";
import { View, AddArrayFromBuilder } from "ui/core/view";
import { ContentView } from "ui/content-view";
export module knownCollections {
    export var items = "items";
}

function onSelectedIndexChanged(data: PropertyChangeData) {
    const pager = <Pager>data.object;
    pager.updateIndex(pager.selectedIndex);
}

function onItemsChanged(data: PropertyChangeData) {
    const pager = <Pager>data.object;
    pager.updateItems(<Array<View>>data.oldValue, <Array<View>>data.newValue);
}
export abstract class Pager extends View implements AddArrayFromBuilder {
    private _disableSwipe: boolean;
    private _pageSpacing: number = 0;
    public static selectedIndexProperty = new Property("selectedIndex", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.None, onSelectedIndexChanged));
    public static itemsProperty = new Property("items", "Pager", new PropertyMetadata(undefined, PropertyMetadataSettings.None, onItemsChanged));

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
    set selectedIndex(value: number) {
        this._setValue(Pager.selectedIndexProperty, value);
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
    public abstract updateItems(oldItems: Array<View>, newItems: Array<View>): void;

    public abstract updateIndex(index: number): void;
}

export abstract class PagerItem extends View { }
