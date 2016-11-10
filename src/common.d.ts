import { Property } from "ui/core/dependency-observable";
import { View, AddArrayFromBuilder } from "ui/core/view";
export declare module knownCollections {
    var items: string;
}
export declare abstract class Pager extends View implements AddArrayFromBuilder {
    private _disableSwipe;
    private _pageSpacing;
    static selectedIndexProperty: Property;
    static itemsProperty: Property;
    _addArrayFromBuilder(name: string, value: Array<any>): void;
    items: Array<any>;
    selectedIndex: number;
    disableSwipe: boolean;
    pageSpacing: number;
    abstract updateItems(oldItems: Array<View>, newItems: Array<View>): void;
    abstract updateIndex(index: number): void;
}
export declare abstract class PagerItem extends View {
}
