import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';

import { PagerModule } from 'nativescript-pager/angular';

import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

import { TestComponent } from './test/test.component';
import { DummyComponent } from './dummy.component';
import { TestMultiComponent } from './test-multi/test-multi.component';
import { TestListComponent } from './test-list/test-list.component';
import { StaticComponent } from '~/static/static.component';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        PagerModule
    ],
    declarations: [
        AppComponent,
        TestComponent,
        TestMultiComponent,
        TestListComponent,
        DummyComponent,
        StaticComponent
    ],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
}
