import * as React from 'react';
import { Pager, PagerItem } from '@nativescript-community/ui-pager/react';
import { ObservableArray } from '@nativescript/core/data/observable-array';
import { Page, Frame } from '@nativescript/core';

const apiPageRef = React.createRef<NSVElement<Page>>();
const listPageRef = React.createRef<NSVElement<Page>>();
const staticPageRef = React.createRef<NSVElement<Page>>();
const regularPageRef = React.createRef<NSVElement<Page>>();
import { StaticPage } from './StaticPage';
import { NSVElement, render } from 'react-nativescript';

interface Props {
    forwardedRef?: React.RefObject<NSVElement<Frame>>
}
interface State {
    _items: any[],
    _originalItems: any[],
    items: ObservableArray<any>,
    disableSwipe: boolean,
    selectedIndex: number;
}
export class AppContainer extends React.Component<Props, State> {
    private readonly myRef = React.createRef<NSVElement<Frame>>();
    private readonly myPage = React.createRef<NSVElement<Page>>();
    state = {
        disableSwipe: false,
        selectedIndex: 3,
        items: new ObservableArray([]),
        _items: [
            { title: 'Slide 1', image: 'https://robohash.org/1.png?set=2' },
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
        ],
        _originalItems: [
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
        ],

    }
    constructor(props) {
        super(props);
        this.state.items.push(...this.state._originalItems);
    }

    private toggleSwipe(event) {
        this.state.disableSwipe = !this.state.disableSwipe;
    }

    private goToApi(event) {
        const frame: Frame = this.props.forwardedRef.current!.nativeView;
        frame.navigate({
            create: () => {
                return apiPageRef.current!.nativeView;
            }
        });
    }


    private goToPagerWithLists(event) {
        const frame: Frame = this.props.forwardedRef.current!.nativeView;
        frame.navigate({
            create: () => {
                return listPageRef.current!.nativeView;;
            }
        });
    }

    private goToStatic(event) {
        const ref = this.props.forwardedRef || this.myRef;
         const frame: Frame = ref.current!.nativeView;
        frame.navigate({
            create: () => {
                return render(
                    <StaticPage forwardedRef={staticPageRef}/>, this.myPage.current
                )
            }
        });
    }

    private goToRegular(event) {
        const ref = this.props.forwardedRef || this.myRef;
        const frame: Frame = ref.current!.nativeView;
        frame.navigate({
            create: () => {
                return regularPageRef.current!.nativeView;;
            }
        });
    }

    private prevPage() {
        --this.state.selectedIndex;
    }

    private nextPage() {
        ++this.state.selectedIndex;
    }

    private firstPage() {
        this.state.selectedIndex = 0;
    }

    private lastPage() {
        this.state.selectedIndex = this.state.items.length - 1;
    }

    private resetItems() {
        this.state.items.splice(0, this.state.items.length, ...this.state._originalItems);
    }

    private removeNextItems() {
        const selectedIndex = this.state.selectedIndex;
        const count = (this.state.items.length) - (selectedIndex + 1);
        this.state.items.splice(selectedIndex + 1, count);
        const item = this.state.items.getItem(selectedIndex);
        item['title'] = `After Reset ${selectedIndex + 1}`;
        this.state.items.setItem(selectedIndex, item);
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
        const { forwardedRef } = this.props;
        return (
            <frame ref={this.myRef}>
                <page ref={this.myPage}>
                    <gridLayout rows="*,auto">
                        <Pager
                disableSwipe={this.state.disableSwipe}
                loadMoreItems={this.loadMoreItems}
                height={{ unit: "%", value: 100 }}
                 peaking={"10%"}
                  spacing={"10%"}
                   selectedIndex={this.state.selectedIndex}
                   selectedIndexChange={this.selectedIndexChange.bind(this)}
                    items={this.state.items}
                     cellFactory={
                    (item, ref) => {
                        return (
                            <stackLayout id={item.title} ref={ref}>
                                <label text={item.title}/>
                                <imageCacheIt width={300} height={300} stretch={'aspectFill'}
                                        src={item.image}/>
                            </stackLayout>
                        );
                    }
                }/>



{/* <Pager row={0} col={0} selectedIndex={this.state.selectedIndex} height={{unit: '%', value: 100}}>
                    <PagerItem backgroundColor={'red'}>
                        <label text={'First'}/>
                    </PagerItem>
                    <PagerItem backgroundColor={'white'}>
                        <label text={'Second'}/>
                    </PagerItem>
                    <PagerItem backgroundColor={'black'}>
                        <label text={'Third'} color={'white'}/>
                    </PagerItem>
                    <PagerItem backgroundColor={'green'}>
                        <label text={'Fourth'}/>
                    </PagerItem>
                    <PagerItem backgroundColor={'pink'}>
                        <label text={'Fifth'}/>
                    </PagerItem>
                </Pager> */}

                        <scrollView row={1}>
                            <stackLayout>
                                <label text={this.state.selectedIndex + ""} />
                                <button text={"Pager With List"} onTap={this.goToPagerWithLists.bind(this)} />
                                <button text={"Static Pager"} onTap={this.goToStatic.bind(this)} />
                                <button text={"Api Demo"} onTap={this.goToApi.bind(this)} />
                                <button text={"Pager Regular Array"} onTap={this.goToRegular.bind(this)} />
                                <button text={"Toggle Swipe"} onTap={this.toggleSwipe.bind(this)} />
                                <stackLayout>
                                    <button text={"Prev"} onTap={this.prevPage.bind(this)} />
                                    <button text={"Next"} onTap={this.nextPage.bind(this)} />
                                    <button text={"First"} onTap={this.firstPage.bind(this)} />
                                    <button text={"Last"} onTap={this.lastPage.bind(this)} />
                                    <button text={"Remove Items"} onTap={this.removeNextItems.bind(this)} />
                                    <button text={"Reset Items"} onTap={this.resetItems.bind(this)} />
                                </stackLayout>

                                {/* <$Button text="Nav" tap="navigate"/> */}
                            </stackLayout>
                        </scrollView>
                    </gridLayout>
                </page>
            </frame>
        );
    }
}
