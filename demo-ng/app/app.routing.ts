import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { TestComponent } from "./test/test.component";
import { TestMultiComponent } from './test-multi/test-multi.component';
import { DummyComponent } from "./dummy.component";
import { TestListComponent } from "./test-list/test-list.component";

const routes: Routes = [
  { path: '', redirectTo: '/test', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'multi', component: TestMultiComponent },
  { path: 'dummy', component: DummyComponent },
  { path: 'list', component: TestListComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
