import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { TestComponent } from "./test/test.component";
import { DummyComponent } from "./dummy.component";

const routes: Routes = [
    { path: "", redirectTo: "/test", pathMatch: "full" },
    { path: "test", component: TestComponent },
    { path: "dummy", component: DummyComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }