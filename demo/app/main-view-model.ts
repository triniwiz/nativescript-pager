import { Observable } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

export class HelloWorldModel extends Observable {
  items: ObservableArray<any>;
  index: number;
  private _items = [
    { title: 'Slide 1', image: '~/images/Hulk_(comics_character).png' },
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
      image:
        'http://img15.deviantart.net/60ea/i/2012/310/e/4/shazam_by_maiolo-d5k6fr5.jpg'
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
      image: 'http://cartoonbros.com/wp-content/uploads/2016/05/Batman-4.jpg'
    },
    {
      title: 'Slide 9',
      image:
        'http://otakukart.com/animeblog/wp-content/uploads/2016/04/Kurama-Naruto.png'
    },
    {
      title: 'Slide 10',
      image:
        'https://images.unsplash.com/photo-1474861644511-0f2775ae97cc?auto=format&fit=crop&w=2391&q=80'
    }
  ];
  constructor() {
    super();
    this.items = new ObservableArray([
      {
        title: 'Slide 1',
        image: '~/images/Hulk_(comics_character).png',
        items: this._items
      },
      {
        title: 'Slide 2',
        image:
          'https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg',
        items: this._items
      },
      {
        title: 'Slide 3',
        image:
          'https://images.unsplash.com/photo-1487715433499-93acdc0bd7c3?auto=format&fit=crop&w=2228&q=80',
        items: this._items
      },
      {
        title: 'Slide 4',
        image:
          'http://img15.deviantart.net/60ea/i/2012/310/e/4/shazam_by_maiolo-d5k6fr5.jpg',
        items: this._items
      },
      {
        title: 'Slide 5',
        image: 'https://i.annihil.us/u/prod/marvel/i/mg/d/f0/558982863130d.jpg',
        items: this._items
      },
      {
        title: 'Slide 6',
        image:
          'https://images.unsplash.com/photo-1466872732082-8966b5959296?auto=format&fit=crop&w=2100&q=80',
        items: this._items
      },
      {
        title: 'Slide 7',
        image:
          'https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?auto=format&fit=crop&w=2100&q=80',
        items: this._items
      },
      {
        title: 'Slide 8',
        image: 'https://i.ytimg.com/vi/DKbkKJWYT6E/maxresdefault.jpg',
        items: this._items
      },
      {
        title: 'Slide 9',
        image:
          'http://otakukart.com/animeblog/wp-content/uploads/2016/04/Kurama-Naruto.png',
        items: this._items
      },
      {
        title: 'Slide 10',
        image:
          'https://images.unsplash.com/photo-1474861644511-0f2775ae97cc?auto=format&fit=crop&w=2391&q=80',
        items: this._items
      }
    ]);
  }
}
