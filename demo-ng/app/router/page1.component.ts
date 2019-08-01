import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
    selector: 'page1',
    moduleId: module.id,
    templateUrl: './page1.component.html'

})

export class Page1Component implements OnInit {
    constructor(private routerExtensions: RouterExtensions) {
    }

    goToPageOne() {
        this.routerExtensions.navigate(['/router-test/page1']);
    }

    goToPageTwo() {
        this.routerExtensions.navigate(['/router-test/page2']);
    }

    ngOnInit() {
    }
}
