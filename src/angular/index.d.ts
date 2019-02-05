import { ElementRef, IterableDiffers } from '@angular/core';
import { Pager } from '../pager';
import { TemplatedItemsComponent } from './pager-items-comp';
export declare class PagerComponent extends TemplatedItemsComponent {
    readonly nativeElement: Pager;
    protected templatedItemsView: Pager;
    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers);
}
export declare class PagerModule {
}
