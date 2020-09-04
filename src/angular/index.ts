import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    IterableDiffers,
    NgModule,
    NO_ERRORS_SCHEMA
} from '@angular/core';

import { Pager } from '@nativescript-community/ui-pager';
import {
    PagerItemDirective,
    TEMPLATED_ITEMS_COMPONENT,
    TemplatedItemsComponent,
    TemplateKeyDirective
} from './pager-items-comp';

export {PagerItemDirective, TemplatedItemsComponent, TemplateKeyDirective} from './pager-items-comp';

@Component({
    selector: 'Pager',
    template: `
		<DetachedContainer>
			<Placeholder #loader></Placeholder>
		</DetachedContainer>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TEMPLATED_ITEMS_COMPONENT,
            useExisting: forwardRef(() => PagerComponent)
        }
    ]
})

export class PagerComponent extends TemplatedItemsComponent {
    public get nativeElement(): Pager {
        return this.templatedItemsView;
    }

    protected templatedItemsView: Pager;

    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers) {
        super(_elementRef, _iterableDiffers);
    }
}

@NgModule({
    declarations: [PagerComponent, TemplateKeyDirective, PagerItemDirective],
    exports: [PagerComponent, TemplateKeyDirective, PagerItemDirective],
    schemas: [NO_ERRORS_SCHEMA]
})
export class PagerModule {
}
