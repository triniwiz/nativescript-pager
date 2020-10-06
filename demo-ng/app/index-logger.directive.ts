import { Directive, OnInit, OnDestroy, Input, Host, Optional } from '@angular/core';
import { PagerComponent } from '@nativescript-community/ui-pager/angular';

let autoId = 0;

let ngViewMap = {};
function ensureArray(id: string) {
    if (!ngViewMap.hasOwnProperty(id)) {
        ngViewMap[id] = [];
    }
}
let allViews = [];

@Directive({
    selector: '[pagerIndex]',
})
export class IndexLoggerDirective implements OnInit, OnDestroy {
    @Input() pagerIndex: number;
    pagerId: string = 'all';
    currentViewId = autoId++;
    constructor(@Optional() @Host() private parent: PagerComponent) { }
    ngOnInit() {
        if (this.parent) {
            if ((this.parent as any).__indexLoggerId == null) {
                (this.parent as any).__indexLoggerId = `${autoId++}`;
            }
            this.pagerId = (this.parent as any).__indexLoggerId;
        }
        ensureArray(this.pagerId);
        ngViewMap[this.pagerId].push(this.currentViewId);
        allViews.push(this.currentViewId);
        console.log(`Angular element ${this.currentViewId} created for index ${this.pagerIndex} on pager ${this.pagerId} (${ngViewMap[this.pagerId].length} in this pager, ${allViews.length} in total)`);
    }

    ngOnDestroy() {
        this.parent = null;
        ensureArray(this.pagerId);
        const idx = ngViewMap[this.pagerId].indexOf(this.currentViewId);
        if (idx >= 0) { ngViewMap[this.pagerId].splice(idx, 1); }
        const allIdx = allViews.indexOf(this.currentViewId);
        if (allIdx >= 0) { allViews.splice(idx, 1); }
        console.log(`Angular element ${this.currentViewId} destroyed for index ${this.pagerIndex} on pager ${this.pagerId} (${ngViewMap[this.pagerId].length} total)`);
    }
}