// import { PropertyMetadataSettings, Property, PropertyChangeData } from "ui/core/dependency-observable";
// import { PropertyMetadata } from "ui/core/proxy";
import { View, Property, CoercibleProperty, booleanConverter } from "ui/core/view";
import * as types from "utils/types";

export const ITEMSLOADING = "itemsLoading";

export module knownTemplates {
    export const itemTemplate = "itemTemplate";
}

export module knownCollections {
    export const items = "items";
}

export abstract class Pager extends View {
    // Make TS happy
    public items: any;
    public selectedIndex: number;
    public showNativePageIndicator: boolean;
    public itemTemplate: any;


    private _disableSwipe: boolean;
    private _pageSpacing: number = 0;

    public static selectedIndexChangedEvent = "selectedIndexChanged";

    _getData(index: number) {
        let items = <any>this.items;
        return items.getItem ? items.getItem(index) : items[index];
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
    
    public abstract updateNativeItems(oldItems: Array<View>, newItems: Array<View>): void;
    public abstract updateNativeIndex(oldIndex: number, newIndex: number): void;
    public abstract itemTemplateUpdated(oldData, newData): void;
}

function onItemsChanged(pager: Pager, oldValue, newValue) {
    if (newValue) {
        pager.updateNativeItems(oldValue, newValue);
    }
}

function onItemTemplateChanged(pager: Pager, oldValue, newValue) {
    pager.itemTemplateUpdated(oldValue, newValue);
};

function onSelectedIndexChanged(pager: Pager, oldValue, newValue) {
    if (pager && pager.items && types.isNumber(newValue)) {
        pager.updateNativeIndex(oldValue, newValue);
        pager.notify({ eventName: Pager.selectedIndexChangedEvent, object: pager, oldIndex: oldValue, newIndex: newValue });
    }
}

export const selectedIndexProperty = new CoercibleProperty<Pager, number>({
    name: "selectedIndex",
    defaultValue: 0,
    valueChanged: onSelectedIndexChanged,
    coerceValue: (target, value) => {
        const max = target.items ? target.items.length - 1 : 0;
        value = Math.min(value, max);
        value = Math.max(value, 0);
        return value;
    },
    valueConverter: (v) => parseInt(v)
});
selectedIndexProperty.register(Pager);

export const itemsProperty = new Property<Pager, any>({
    name: "items",
    affectsLayout: true,
    valueChanged: onItemsChanged
});
itemsProperty.register(Pager);

export const itemTemplateProperty = new Property<Pager, any>({
    name: "itemTemplate",
    affectsLayout: true,
    valueChanged: onItemTemplateChanged
});
itemTemplateProperty.register(Pager);

export const showNativePageIndicatorProperty = new Property<Pager, boolean>({
    name: "showNativePageIndicator",
    defaultValue: false,
    valueConverter: booleanConverter,
});
showNativePageIndicatorProperty.register(Pager);


export abstract class PagerItem extends View { }