import { Observable } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';

export class NestedPageViewModel extends Observable {
    items: ObservableArray<any>;
    index: number;
    _items = [
        {title: 'Inner Slide 1', image: 'https://robohash.org/1.png?set=2'},
        {
            title: 'Inner Slide 2',
            image:
                'https://robohash.org/2.png?set=2'
        },
        {
            title: 'Inner Slide 3',
            image:
                'https://robohash.org/3.png?set=2'
        },
        {
            title: 'Inner Slide 4',
            image:
                'https://robohash.org/4.png?set=2'
        },
        {
            title: 'Inner Slide 5',
            image: 'https://robohash.org/5.png?set=2'
        },
        {
            title: 'Inner Slide 6',
            image:
                'https://robohash.org/6.png?set=2'
        },
        {
            title: 'Inner Slide 7',
            image:
                'https://robohash.org/7.png?set=2'
        },
        {
            title: 'Inner Slide 8',
            image: 'https://robohash.org/8.png?set=2'
        },
        {
            title: 'Inner Slide 9',
            image:
                'https://robohash.org/9.png?set=2'
        },
        {
            title: 'Inner Slide 10',
            image:
                'https://robohash.org/10.png?set=2'
        }
    ];
    _originalItems = [
        {
            title: 'Slide 1',
            image: 'https://images.unsplash.com/photo-1581538398499-ae6e89710b14',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 2',
            image: 'https://images.unsplash.com/photo-1458724338480-79bc7a8352e4',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 3',
            image: 'https://images.unsplash.com/photo-1456318019777-ccdc4d5b2396',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 4',
            image: 'https://images.unsplash.com/photo-1455098934982-64c622c5e066',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 5',
            image: 'https://images.unsplash.com/photo-1454817481404-7e84c1b73b4a',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 6',
            image: 'https://images.unsplash.com/photo-1454982523318-4b6396f39d3a',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 7',
            image: 'https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 8',
            image: 'https://images.unsplash.com/photo-1423768164017-3f27c066407f',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 9',
            image: 'https://images.unsplash.com/photo-1433360405326-e50f909805b3',
            inner: new ObservableArray(this._items),
            text: ''
        },
        {
            title: 'Slide 10',
            image: 'https://images.unsplash.com/photo-1421749810611-438cc492b581',
            inner: new ObservableArray(this._items),
            text: ''
        }
    ];

    circularMode: boolean = false;
    showIndicator: boolean = false;
    autoPlay: boolean = false;
    // itemsCount: number = 0;
    get toSlice() {
        const now = Date.now();
        return [
            {title: `Slide ${now}`, image: '~/images/Hulk_(comics_character).png', items: this._items},
            {
                title: `Slide ${now}`,
                image:
                    `https://robohash.org/${now}.png`,
                items: this._items
            }
        ];
    }

    constructor() {
        super();
        // this.set('circularMode', false);
        // this.set('showIndicator', true);
        this.items = new ObservableArray(this._originalItems);
        this.set('itemsCount', this.items.length);
        this.items.on('change', args => {
            this.set('itemsCount', this.items.length);
        });
    }

    public resetItems() {
        this.items.splice(0, this.items.length);
        this.items.push(...this._originalItems);
    }
}
