import {Page} from '@nativescript/core/ui/page';
import {HelloWorldModel} from './main-view-model';
import {Pager} from '@nativescript-community/ui-pager';
import {Image} from '@nativescript/core/ui/image';
import {Frame} from '@nativescript/core/ui/frame';

let page: Page;
let vm = new HelloWorldModel();


export function pageLoaded(args) {
    page = <Page>args.object;
    const pager: Pager = <Pager>page.getViewById('pager');
    if (pager) {
        pager.on('loadMoreItems', loadMoreItems.bind(this));
    }
    if (!args.isBackNavigation) {
        page.bindingContext = vm;
    }
}

export function toggleAutoPlay() {
    let autoPlay = vm.get('autoPlay');
    vm.set('autoPlay', !autoPlay);
}

export function toggleSwipe() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.disableSwipe = !pager.disableSwipe;
}

export function onScroll(event) {
    // console.log('x', event.scrollX, 'y', event.scrollY);
}

export function textChange(event) {
    const item = vm.items.getItem(0);
    item['text'] = event.value;
    vm.items.setItem(0, item);
}

export function removeNextItems() {
    const pager: Pager = <Pager>page.getViewById('pager');
    const selectedIndex = pager.selectedIndex;
    const count = (pager.items.length) - (selectedIndex + 1);
    vm.items.splice(selectedIndex + 1, count);
    const item = vm.items.getItem(selectedIndex);
    item['title'] = `After Reset ${selectedIndex + 1}`;
    vm.items.setItem(selectedIndex, item);

}

export function resetItems() {
    vm.resetItems();
}

export function loaded(event) {
}

export function goToApi(event) {
    Frame.topmost().navigate('api/api-page');
}


export function goToPagerWithLists(event) {
    Frame.topmost().navigate('list-page');
}

export function goToStatic(event) {
    Frame.topmost().navigate('static/static-page');
}

export function goToRegular(event) {
    Frame.topmost().navigate('regular/regular-page');
}

export function goToNested(event) {
    Frame.topmost().navigate('nested/nested-page');
}

export function prevPage() {
    const pager: Pager = <Pager>page.getViewById('pager');
    --pager.selectedIndex;
}

export function nextPage() {
    const pager: Pager = <Pager>page.getViewById('pager');
    ++pager.selectedIndex;
}

export function firstPage() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.selectedIndex = 0;
}

export function lastPage() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.selectedIndex = pager.items.length - 1;
}

export function loadedImage($event: any) {
    const image: Image = $event.object;
    // console.log(
    //   `onLoaded: ${image}, size: ${JSON.stringify(image.getActualSize())}}`
    // );
}

export function itemTemplateSelector(
    item: any,
    index: number,
    items: Array<any>
) {
    return index % 2 === 0 ? 'even' : 'odd';
}

export function selectedIndexChange(event) {
    const selectedIndex = event.object.get('selectedIndex');
    vm.set('index', selectedIndex);
}

export function loadMoreItems(event) {
    const selectedIndex = event.object.get('selectedIndex');
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
    });
}

export function navigate() {
    Frame.topmost().navigate('dummy-page');
}

export function toggleIndicator(event) {
    const state = vm.get('showIndicator');
    vm.set('showIndicator', !state);
    console.log('toggleIndicator', state, vm.get('showIndicator'));
}

export function toggleCircularMode(event) {
    const state = vm.get('circularMode');
    console.log('circularMode', state);
    vm.set('circularMode', !state);
    console.log('circularMode', state, vm.get('circularMode'));
}
