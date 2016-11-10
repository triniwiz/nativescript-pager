import { ElementRef, Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { Pager, PagerItem } from "../pager";
import { View } from "ui/core/view";
import * as platform from "platform";
@Directive({
    selector: 'Pager',
    inputs: ['selectedIndex']
})
export class PagerDirective {
    public pager: Pager;
    private _selectedIndex: number;
    private viewInitialized: boolean;

    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value) {
        this._selectedIndex = value;
        if (this.viewInitialized) {
            this.pager.selectedIndex = this._selectedIndex;
        }
    }

    constructor(private element: ElementRef) {
        this.pager = element.nativeElement;
        if (platform.isIOS) {
            this.pager.items = [];
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.pager.selectedIndex = this._selectedIndex;
    }
}

@Directive({
    selector: '[pagerItem]'
})
export class PagerItemDirective {
    private item: PagerItem;
    constructor(
        private owner: PagerDirective,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) {
    }

    private ensureItem() {
        if (!this.item) {
            this.item = new PagerItem();
        }
    }

    ngOnInit() {
        this.ensureItem();

        const viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
        //Filter out text nodes, etc
        const realViews = viewRef.rootNodes.filter((node) =>
            node.nodeName && node.nodeName !== '#text')
        if (realViews.length > 0) {
            if (platform.isIOS) {
                this.item = realViews[0];
                let newItems: Array<any> = (this.owner.pager.views || []).concat([this.item]);
                this.owner.pager.views = newItems;
                newItems.forEach((item, index) => {
                    this.owner.pager.items.push(item);
                });
            } else if (platform.isAndroid) {
                this.item._addView(realViews[0]);
                const newItems = (this.owner.pager.items || []).concat([this.item]);
                this.owner.pager.items = newItems;
            }
        }
    }
}