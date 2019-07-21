import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'ns-test',
  templateUrl: './test.component.html',
  styleUrls: ['test.component.css']
})
export class TestComponent implements OnInit {
  numItems;
  currentPagerIndex = 5;
  latestReceivedIndex = 0;
  items: any;
  @ViewChild('pager', { static: true }) pager: ElementRef;
  // tslint:disable-next-line:semicolon
  public templateSelector = (item: any, index: number, items: any) => {
    return index % 2 === 0 ? 'even' : 'odd';
  }

  constructor() {
    this.items = new BehaviorSubject([
      {
        title: 'Slide 1',
        image: '~/images/Hulk_(comics_character).png'
      },
      {
        title: 'Slide 2',
        image:
          'https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg'
      },
      {
        title: 'Slide 3',
        image:
          'https://images.unsplash.com/photo-1487715433499-93acdc0bd7c3?auto=format&fit=crop&w=2228&q=80'
      },
      {
        title: 'Slide 4',
        image: 'http://img15.deviantart.net/60ea/i/2012/310/e/4/shazam_by_maiolo-d5k6fr5.jpg'
      },
      {
        title: 'Slide 5',
        image: 'https://i.annihil.us/u/prod/marvel/i/mg/d/f0/558982863130d.jpg'
      },
      {
        title: 'Slide 6',
        image:
          'https://images.unsplash.com/photo-1466872732082-8966b5959296?auto=format&fit=crop&w=2100&q=80'
      },
      {
        title: 'Slide 7',
        image:
          'https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?auto=format&fit=crop&w=2100&q=80'
      },
      {
        title: 'Slide 8',
        image:
          'https://images.unsplash.com/photo-1519625073050-2815233885ab?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1955&q=80'
      },
      {
        title: 'Slide 9',
        image: 'http://otakukart.com/animeblog/wp-content/uploads/2016/04/Kurama-Naruto.png'
      },
      {
        title: 'Slide 10',
        image:
          'https://images.unsplash.com/photo-1474861644511-0f2775ae97cc?auto=format&fit=crop&w=2391&q=80'
      }
    ]);
    this.numItems = this.items.value.length;
  }

  ngOnInit(): void {
    setTimeout(() => {
      let newItems = (<BehaviorSubject<any>>this.items).value;
      newItems.push({
        title: 'Slide 11',
        image: '~/images/Hulk_(comics_character).png'
      });
      this.items.next(newItems);
      this.numItems = this.items.value.length;
    }, 1000);
  }

  loaded(index: number) {
    console.log('view loaded', index);
  }

  loadedImage($event) {
    console.log(`loaded image ${$event}`);
  }

  prevPage() {
    const newIndex = Math.max(0, this.currentPagerIndex - 1);
    this.currentPagerIndex = newIndex;
    this.latestReceivedIndex = newIndex;
  }

  nextPage() {
    const newIndex = Math.min(this.numItems - 1, this.currentPagerIndex + 1);
    this.currentPagerIndex = newIndex;
    this.latestReceivedIndex = newIndex;
  }

  onIndexChanged($event) {
    debugObj($event);
    this.latestReceivedIndex = $event.value;
    this.currentPagerIndex = $event.value;
    if (($event.value + 2) % 3 === 0) {
      let newItems = (<BehaviorSubject<any>>this.items).value;
      const items = [
        {
          title: 'Slide ' + (newItems.length + 1),
          image: `https://robohash.org/${newItems.length + 1}.png`
        },
        {
          title: 'Slide ' + (newItems.length + 2),
          image: `https://robohash.org/${newItems.length + 2}.png`
        },
        {
          title: 'Slide ' + (newItems.length + 3),
          image: `https://robohash.org/${newItems.length + 3}.png`
        }
      ];
      newItems.push(...items);
      this.items.next(newItems);
      this.numItems = this.items.value.length;
    }
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
