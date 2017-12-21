import {
    Component,
    NgModule,
    Directive,
    ElementRef,
    TemplateRef,
    IterableDiffers,
    ChangeDetectorRef,
    ViewContainerRef,
    Input,
    Inject,
    forwardRef,
    ChangeDetectionStrategy,
    NO_ERRORS_SCHEMA,
    ɵisListLikeIterable as isListLikeIterable
} from "@angular/core";
import { registerElement, getSingleViewRecursive } from "nativescript-angular/element-registry";
import { View } from "ui/core/view";
import { isBlank } from "nativescript-angular/lang-facade";
import { ObservableArray } from "data/observable-array";

export const ITEMSLOADING = "itemsLoading";
const NG_VIEW = "_ngViewRef";

registerElement("Pager", () => require("../").Pager);

export interface ComponentView {
    rootNodes: Array<any>;

    destroy(): void;
};

export type RootLocator = (nodes: Array<any>, nestLevel: number) => View;

export function getItemViewRoot(viewRef: ComponentView, rootLocator: RootLocator = getSingleViewRecursive): View {
    return rootLocator(viewRef.rootNodes, 0);
}

@Directive({
    selector: "[pagerItemTemplate]"
})
export class PagerItemTemplate {
    constructor( @Inject(forwardRef(() => PagerComponent)) private owner: PagerComponent,
        private templateRef: TemplateRef<any>) {
        owner.itemTemplate = this.templateRef;
    }
}

@Component({
    selector: 'Pager',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagerComponent {
    private viewInitialized: any;
    private _selectedIndex: any;
    private _items: any;
    private _differ: any;
    private pager;
    itemTemplate: TemplateRef<PagerItemContext>;

    constructor(el: ElementRef,
        private _iterableDiffers: IterableDiffers,
        private _cdr: ChangeDetectorRef,
        private loader: ViewContainerRef) {
        this.pager = el.nativeElement;
        this.pager.on(ITEMSLOADING, this.itemsLoading, this);
    }

    @Input()
    get items() {
        return this._items;
    }

    set items(value: any) {
        this._items = value;
        this.pager.items = this._items;
    }

    @Input()
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value) {
        this._selectedIndex = parseInt(<any>value, 10);
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

    ngOnDestroy() {
        this.pager.off(ITEMSLOADING, this.itemsLoading, this);
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
    constructor(public $implicit?: any,
        public item?: any,
        public index?: number,
        public even?: boolean,
        public odd?: boolean) {
    }
}

@NgModule({
    declarations: [
        PagerComponent,
        PagerItemTemplate
    ],
    exports: [
        PagerComponent,
        PagerItemTemplate
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PagerModule {
}
