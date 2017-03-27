import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Component({
    selector: "ns-test",
    moduleId: module.id,
    templateUrl: "./test.component.html",
    styleUrls: ['test.component.css']
})
export class TestComponent implements OnInit {
    numItems;
    currentPagerIndex = 0;
    latestReceivedIndex = 0;
    items: any;
    @ViewChild('pager') pager: any;

    constructor() {
        this.items = new BehaviorSubject([
            {
                title: "Slide 1",
                image: "~/images/Hulk_(comics_character).png"
            },
            {
                title: "Slide 2",
                image: "https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg"
            }, {
                title: "Slide 3",
                image: "http://static.srcdn.com/slir/w1000-h500-q90-c1000:500/wp-content/uploads/Batman-Begins-Batman-with-bats.jpg"
            },
            {
                title: "Slide 4",
                image: "http://img15.deviantart.net/60ea/i/2012/310/e/4/shazam_by_maiolo-d5k6fr5.jpg"
            }, {
                title: "Slide 5",
                image: "https://i.annihil.us/u/prod/marvel/i/mg/d/f0/558982863130d.jpg"
            },
            {
                title: "Slide 6",
                image: "https://s-media-cache-ak0.pinimg.com/originals/66/e4/ed/66e4edd3ea18bfcac7f42cc8f5ea3ca0.jpg"
            }, {
                title: "Slide 7",
                image: "http://static.srcdn.com/wp-content/uploads/Superman-fighting-Goku.jpg"
            },
            {
                title: "Slide 8",
                image: "http://cartoonbros.com/wp-content/uploads/2016/05/Batman-4.jpg"
            }, {
                title: "Slide 9",
                image: "http://otakukart.com/animeblog/wp-content/uploads/2016/04/Kurama-Naruto.png"
            },
            {
                title: "Slide 10",
                image: "http://img-cache.cdn.gaiaonline.com/6919f3c814890fd8710efbb9210527c1/http://i1035.photobucket.com/albums/a434/susanoo_takashi/natsu_dragneel___episode_166_by_kagomechan27-d5svkk4_zps567f559b.jpg"
            }
        ]);
        this.numItems = this.items.value.length;
    }

    ngOnInit(): void {
        setTimeout(() => {
           let newItems =  (<BehaviorSubject<any>>this.items).value;
           newItems.push(
                {
                    title: "Slide 11",
                    image: "~/images/Hulk_(comics_character).png"
                }
            );
            this.items.next(newItems);
            this.numItems = this.items.value.length;
        }, 1000);
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
