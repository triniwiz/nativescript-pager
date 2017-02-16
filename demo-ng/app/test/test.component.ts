import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";

@Component({
    selector: "ns-test",
    moduleId: module.id,
    templateUrl: "./test.component.html",
})
export class TestComponent implements OnInit {

    numItems = 10;
    currentPagerIndex = 0;
    latestReceivedIndex = 0;

    @ViewChild('pager') pager: any;

    constructor() { }

    ngOnInit(): void {
    }

    loadedImage($event) {
        console.log(`loaded image ${JSON.stringify($event)}`);
    }

    prevPage() {
        // this.debugObj(this.pager);
        const newIndex = Math.max(0, this.latestReceivedIndex - 1);
        this.currentPagerIndex = newIndex;
        this.latestReceivedIndex = newIndex;
    }

    nextPage() {
        const newIndex = Math.min(this.numItems - 1, this.latestReceivedIndex + 1);
        this.currentPagerIndex = newIndex;
        this.latestReceivedIndex = newIndex;
    }

    onIndexChanged($event) {
        debugObj($event);
        this.latestReceivedIndex = $event.newIndex;
    }

    pageChanged(index: number) {
        console.log(`pageChanged ${JSON.stringify(index)}`);
        debugObj(index);
    }
}

function debugObj(obj: any) {
    for (const key of Object.keys(obj)) {
        console.log(`${key} = ${obj[key]}`);
    }
}
