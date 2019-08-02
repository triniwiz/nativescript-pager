import * as React from 'react';
import { $Pager } from 'nativescript-pager/react';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { $Image, $Label, $StackLayout } from 'react-nativescript';

export const rootRef: React.RefObject<any> = React.createRef<any>();

export class AppContainer extends React.Component<{ forwardedRef: React.RefObject<any> }> {
    private selectedIndex: number = 3;
    private readonly items: ObservableArray<any> = new ObservableArray<any>([]);
    private readonly _items = [
        {title: 'Slide 1', image: 'https://robohash.org/1.png?set=2'},
        {
            title: 'Slide 2',
            image:
                'https://robohash.org/2.png?set=2'
        },
        {
            title: 'Slide 3',
            image:
                'https://robohash.org/3.png?set=2'
        },
        {
            title: 'Slide 4',
            image:
                'https://robohash.org/4.png?set=2'
        },
        {
            title: 'Slide 5',
            image: 'https://robohash.org/5.png?set=2'
        },
        {
            title: 'Slide 6',
            image:
                'https://robohash.org/6.png?set=2'
        },
        {
            title: 'Slide 7',
            image:
                'https://robohash.org/7.png?set=2'
        },
        {
            title: 'Slide 8',
            image: 'https://robohash.org/8.png?set=2'
        },
        {
            title: 'Slide 9',
            image:
                'https://robohash.org/9.png?set=2'
        },
        {
            title: 'Slide 10',
            image:
                'https://robohash.org/10.png?set=2'
        }
    ];
    private readonly _originalItems = [
        {
            title: 'Slide 1',
            image: '~/images/Hulk_(comics_character).png',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 2',
            image: 'https://images.unsplash.com/photo-1458724338480-79bc7a8352e4',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 3',
            image: 'https://images.unsplash.com/photo-1456318019777-ccdc4d5b2396',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 4',
            image: 'https://images.unsplash.com/photo-1455098934982-64c622c5e066',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 5',
            image: 'https://images.unsplash.com/photo-1454817481404-7e84c1b73b4a',
            items: this._items
        },
        {
            title: 'Slide 6',
            image: 'https://images.unsplash.com/photo-1454982523318-4b6396f39d3a',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 7',
            image: 'https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 8',
            image: 'https://images.unsplash.com/photo-1423768164017-3f27c066407f',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 9',
            image: 'https://images.unsplash.com/photo-1433360405326-e50f909805b3',
            items: this._items,
            text: ''
        },
        {
            title: 'Slide 10',
            image: 'https://images.unsplash.com/photo-1421749810611-438cc492b581',
            items: this._items,
            text: ''
        }
    ];

    constructor(props) {
        super(props);
        this.items.push(...this._originalItems);
    }

    render() {
        const {forwardedRef} = this.props;
        return (
            <$StackLayout ref={forwardedRef}>
                <$Pager selectedIndex={this.selectedIndex} items={this.items} cellFactory={
                    (item, ref) => {
                        return (
                            <$StackLayout id={item.title} ref={ref}>
                                <$Label text={item.title}/>
                                <$Image stretch={'aspectFill'}
                                        src={item.image}/>
                            </$StackLayout>
                        );
                    }
                }/>
            </$StackLayout>
        );
    }
}
