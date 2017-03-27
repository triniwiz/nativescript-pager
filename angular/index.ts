import { Component, NgModule, Directive, ElementRef, TemplateRef, IterableDiffers, ChangeDetectorRef, ViewContainerRef, Input, Inject, forwardRef, ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from "@angular/core";
import { Pager, PagerAdapter } from "../src/android/pager";
import { registerElement, ViewClassMeta, NgView, TEMPLATE } from "nativescript-angular/element-registry";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { View } from "ui/core/view";
import { Placeholder } from "ui/placeholder";
export const ITEMSLOADING = "itemsLoading";
import { isListLikeIterable } from "nativescript-angular/collection-facade"
import { isBlank } from "nativescript-angular/lang-facade";
import { convertToInt } from "nativescript-angular/common/utils";
import { LayoutBase } from "ui/layouts/layout-base";
import { ObservableArray } from "data/observable-array";
const NG_VIEW = "_ngViewRef";
registerElement("Pager", () => require("../src/android/pager").Pager);
export interface ComponentView {
    rootNodes: Array<any>;
    destroy(): void;
};

function getSingleViewRecursive(nodes: Array<any>, nestLevel: number): View {
    const actualNodes = nodes.filter((n) => !!n && n.nodeName !== "#text");

    if (actualNodes.length === 0) {
        throw new Error("No suitable views found in list template! Nesting level: " + nestLevel);
    } else if (actualNodes.length > 1) {
        throw new Error("More than one view found in list template! Nesting level: " + nestLevel);
    } else {
        if (actualNodes[0]) {
            let parentLayout = actualNodes[0].parent;
            if (parentLayout instanceof LayoutBase) {
                parentLayout.removeChild(actualNodes[0]);
            }
            return actualNodes[0];
        } else {
            return getSingleViewRecursive(actualNodes[0].children, nestLevel + 1);
        }
    }
}

export type RootLocator = (nodes: Array<any>, nestLevel: number) => View;

export function getItemViewRoot(viewRef: ComponentView, rootLocator: RootLocator = getSingleViewRecursive): View {
    const rootView = rootLocator(viewRef.rootNodes, 0);
    rootView.on("unloaded", () => {
        viewRef.destroy();
    });
    return rootView;
}


@Directive({
    selector: "[pagerItemTemplate]"
})
export class PagerItemTemplate {
    constructor(
        @Inject(forwardRef(() => PagerComponent)) owner: PagerComponent,
        private templateRef: TemplateRef<any>
    ) {
        owner.itemTemplate = this.templateRef;
    }
}

@Component({
    selector: 'Pager',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagerComponent {
    viewInitialized: any;
    private _selectedIndex: any;
    private _items: any;
    _differ: any;
    pager;
    itemTemplate: TemplateRef<PagerItemContext>;
    constructor(
        el: ElementRef,
        private _iterableDiffers: IterableDiffers,
        private _cdr: ChangeDetectorRef,
        private loader: ViewContainerRef
    ) {
        this.pager = el.nativeElement;
        this.pager.on(ITEMSLOADING, this.itemsLoading, this);
    }
    @Input()
    get items() {
        return this._items;
    }
    set items(value: any) {
        this._items = value;
        let needDiffer = true;
        if (value instanceof ObservableArray) {
            needDiffer = false;
        }
        if (needDiffer && !this._differ && isListLikeIterable(value)) {
            this._differ = this._iterableDiffers.find(this._items)
                .create(this._cdr, (_index, item) => { return item; });
        }

        this.pager.items = this._items;
    }

    @Input()
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value) {
        this._selectedIndex = convertToInt(value);
        if (this.viewInitialized) {
            this.pager.selectedIndex = this._selectedIndex;
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        if (!isBlank(this._selectedIndex)) {
            this.pager.selectedIndex = this._selectedIndex;
        }
    }

    itemsLoading(args): void {
        if (this.itemTemplate) {
            const data = this.pager._getData(args.index);
            const viewRef = this.loader.createEmbeddedView(this.itemTemplate, new PagerItemContext(), 0);
            args.view = getItemViewRoot(viewRef);
            args.view[NG_VIEW] = viewRef;
            this.setupViewRef(viewRef, data, args.index);
            this.detectChangesOnChild(viewRef, args.index);
        }
    }
    setupViewRef(viewRef, data, index): void {
        if (isBlank(viewRef)) {
            return;
        }
        const context = viewRef.context;
        context.$implicit = data;
        context.item = data;
        context.items = ((data && (typeof data.get === "function")) ? data.get("items") : data["items"]);
        context.index = index;
        context.even = (index % 2 === 0);
        context.odd = !context.even;

    }

    detectChangesOnChild(viewRef, index): void {
        const childChangeDetector = <ChangeDetectorRef>(<any>viewRef);
        childChangeDetector.markForCheck();
        childChangeDetector.detectChanges();
    }
    ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this._items);
            if (changes) {
                if (this.pager) {
                    this.pager.refresh();
                }
            }
        }
    }
}


export class PagerItemContext {
    constructor(
        public $implicit?: any,
        public item?: any,
        public index?: number,
        public even?: boolean,
        public odd?: boolean
    ) {
    }
}

@NgModule({
    declarations: [PagerComponent, PagerItemTemplate],
    exports: [PagerComponent, PagerItemTemplate],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PagerModule {
}

