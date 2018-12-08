import { Component } from '@angular/core';

@Component({
    selector: 'ns-static',
    moduleId: module.id,
    templateUrl: './static.component.html',
    styleUrls: ['static.component.css']
})
export class StaticComponent {
    currentPagerIndex = 5;
}