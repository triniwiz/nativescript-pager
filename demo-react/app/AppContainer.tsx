import * as React from 'react';
import { $Pager } from 'nativescript-pager/react';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { $Image, $Label, $StackLayout, $GridLayout, $Button, $ScrollView, render, $Frame } from 'react-nativescript';
import { $ImageCacheIt } from './nativescript-image-cache-it';
import { ItemSpec } from 'tns-core-modules/ui/layouts/grid-layout/grid-layout';
import { Page } from 'react-nativescript/dist/client/ElementRegistry';

const apiPageRef = React.createRef<Page>();
const listPageRef = React.createRef<Page>();
const staticPageRef = React.createRef<Page>();
const regularPageRef = React.createRef<Page>();
import { StaticPage } from './StaticPage';
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
    private disableSwipe: boolean = false;
    constructor(props) {
        super(props);
        this.items.push(...this._originalItems);
    }

    private toggleSwipe(event) {
        this.disableSwipe = !this.disableSwipe;
    }

    private goToApi(event) {
        const currentPage: Page = this.props.forwardedRef.current!;
        currentPage.frame.navigate({
            create: () => {
                return apiPageRef.current;
            }
        });
    }


    private goToPagerWithLists(event) {
        const currentPage: Page = this.props.forwardedRef.current!;
        currentPage.frame.navigate({
            create: () => {
                return listPageRef.current;
            }
        });
    }

    private goToStatic(event) {
        const currentPage: Page = this.props.forwardedRef.current!;
        console.log(currentPage.frame, event.object.frame);
        /*currentPage.frame.navigate({
            create: () => {
                return render(
                    <StaticPage forwardedRef={staticPageRef}></StaticPage>,{},null
                )
            }
        });*/
    }

    private goToRegular(event) {
        const currentPage: Page = this.props.forwardedRef.current!;
        currentPage.frame.navigate({
            create: () => {
                return regularPageRef.current;
            }
        });
    }

    private prevPage() {
        --this.selectedIndex;
    }

    private nextPage() {
        ++this.selectedIndex;
    }

    private firstPage() {
        this.selectedIndex = 0;
    }

    private lastPage() {
        this.selectedIndex = this.items.length - 1;
    }

    private resetItems() {
        this.items.splice(0, this.items.length, ...this._originalItems);
    }

    private removeNextItems() {
        const selectedIndex = this.selectedIndex;
        const count = (this.items.length) - (selectedIndex + 1);
        this.items.splice(selectedIndex + 1, count);
        const item = this.items.getItem(selectedIndex);
        item['title'] = `After Reset ${selectedIndex + 1}`;
        this.items.setItem(selectedIndex, item);
    }

    private selectedIndexChange(event) {
        console.log('selectedIndexChange', event);
        // const selectedIndex = event.object.get('selectedIndex');
        // vm.set('index', selectedIndex);
    }

    private loadMoreItems(event) {
        /*const selectedIndex = event.object.get('selectedIndex');
        vm.set('index', selectedIndex);
        vm.items.push({
            title: 'Slide ' + (vm.items.length + 1),
            image: `https://robohash.org/${vm.items.length + 1}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 2),
            image: `https://robohash.org/${vm.items.length + 2}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 3),
            image: `https://robohash.org/${vm.items.length + 3}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 4),
            image: `https://robohash.org/${vm.items.length + 4}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 5),
            image: `https://robohash.org/${vm.items.length + 5}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 6),
            image: `https://robohash.org/${vm.items.length + 6}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 7),
            image: `https://robohash.org/${vm.items.length + 7}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 8),
            image: `https://robohash.org/${vm.items.length + 8}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 9),
            image: `https://robohash.org/${vm.items.length + 9}.png`,
            items: vm._items
        }, {
            title: 'Slide ' + (vm.items.length + 10),
            image: `https://robohash.org/${vm.items.length + 10}.png`,
            items: vm._items
        });*/
    }
    render() {
        const {forwardedRef} = this.props;
        return (
            <$GridLayout ref={forwardedRef} rows={[new ItemSpec(1, "star"), new ItemSpec()]}>
                <$Pager
                disableSwipe={this.disableSwipe}
                loadMoreItems={this.loadMoreItems}
                height={{ unit: "%", value: 100 }}
                 peaking={"10%"}
                  spacing={"10%"}
                   selectedIndex={this.selectedIndex}
                   selectedIndexChange={this.selectedIndexChange.bind(this)}
                    items={this.items}
                     cellFactory={
                    (item, ref) => {
                        return (
                            <$StackLayout id={item.title} ref={ref}>
                                <$Label text={item.title}/>
                                <$ImageCacheIt width={300} height={300} stretch={'aspectFill'}
                                        src={item.image}/>
                            </$StackLayout>
                        );
                    }
                }/>
                <$ScrollView row={1}>
                <$StackLayout >
                <$Label text={this.selectedIndex + ""}/>
                <$Button text={"Pager With List"} onTap={this.goToPagerWithLists.bind(this)}/>
                <$Button text={"Static Pager"} onTap={this.goToStatic.bind(this)} />
                <$Button text={"Api Demo"} onTap={this.goToApi.bind(this)} />
                <$Button text={"Pager Regular Array"} onTap={this.goToRegular.bind(this)}/>
                <$Button text={"Toggle Swipe"} onTap={this.toggleSwipe.bind(this)}/>
                <$StackLayout>
                    <$Button text={"Prev"} onTap={this.prevPage.bind(this)}/>
                    <$Button text={"Next"} onTap={this.nextPage.bind(this)}/>
                    <$Button text={"First"} onTap={this.firstPage.bind(this)}/>
                    <$Button text={"Last"} onTap={this.lastPage.bind(this)}/>
                    <$Button text={"Remove Items"} onTap={this.removeNextItems.bind(this)}/>
                    <$Button text={"Reset Items"} onTap={this.resetItems.bind(this)}/>
                </$StackLayout>

                {/* <$Button text="Nav" tap="navigate"/> */}
                </$StackLayout>
                </$ScrollView>
            </$GridLayout>
        );
    }
}
