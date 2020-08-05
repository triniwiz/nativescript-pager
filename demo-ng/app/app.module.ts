import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from '@nativescript/angular';
import { NativeScriptFormsModule } from '@nativescript/angular';

import { PagerModule } from '@nativescript-community/ui-pager/angular';

import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

import { TestComponent } from './test/test.component';
import { DummyComponent } from './dummy.component';
import { TestMultiComponent } from './test-multi/test-multi.component';
import { TestListComponent } from './test-list/test-list.component';
import { StaticComponent } from './static/static.component';
import { RouterComponent } from './router/router.component';
import { Page1Component } from './router/page1.component';
import { IndexLoggerDirective } from './index-logger.directive';
import { TNSImageCacheItModule } from 'nativescript-image-cache-it/angular';
@NgModule({
    bootstrap: [AppComponent],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        PagerModule,
        TNSImageCacheItModule
    ],
    declarations: [
        AppComponent,
        TestComponent,
        TestMultiComponent,
        TestListComponent,
        DummyComponent,
        StaticComponent,
        RouterComponent,
        Page1Component,
        IndexLoggerDirective
    ],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
}
