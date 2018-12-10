import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ns-static',
    templateUrl: './static.component.html',
    styleUrls: ['static.component.css']
})
export class StaticComponent {
    currentPagerIndex = 5;
}