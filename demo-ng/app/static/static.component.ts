import { Component, ViewChildren, QueryList } from '@angular/core';
import { PagerItemDirective } from '@nativescript-community/ui-pager/angular/pager-items-comp';

@Component({
    moduleId: module.id,
    selector: 'ns-static',
    templateUrl: './static.component.html',
    styleUrls: ['static.component.css']
})
export class StaticComponent {
    @ViewChildren(PagerItemDirective) pages: QueryList<PagerItemDirective>;

    currentPagerIndex = 0;

    prevPage() {
        const newIndex = Math.max(0, this.currentPagerIndex - 1);
        this.currentPagerIndex = newIndex;
    }

    nextPage() {
        const newIndex = Math.min(this.pages.length - 1, this.currentPagerIndex + 1);
        this.currentPagerIndex = newIndex;
    }
}