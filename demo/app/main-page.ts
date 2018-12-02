import { NavigatedData, Page } from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { Pager } from 'nativescript-pager';
import { Image } from 'tns-core-modules/ui/image';
import { topmost } from 'tns-core-modules/ui/frame';

let page: Page;
let vm = new HelloWorldModel();

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: NavigatedData) {
    // Get the event sender
    page = <Page>args.object;
    if (!args.isBackNavigation) {
        page.bindingContext = vm;
    }
}

export function pageLoaded() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.on('loadMoreItems', loadMoreItems.bind(this));
}

export function toggleSwipe() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.disableSwipe = !pager.disableSwipe;
}

export function removeNextItems() {
    const pager: Pager = <Pager>page.getViewById('pager');
    const selectedIndex = pager.selectedIndex;
    const count = (pager.items.length - 1) - selectedIndex;
    vm.items.splice(selectedIndex, count);
    const item = vm.items.getItem(selectedIndex);
    console.log('selectedIndex', selectedIndex);
    item['title'] = `After Reset ${selectedIndex}`;
    vm.items.setItem(vm.index, item);

}

export function resetItems() {
    page.bindingContext = vm = new HelloWorldModel();
}


export function goToPagerWithLists(event) {
    topmost().navigate('list-page');
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
    /*
    vm.items.push({
        title: 'Slide ' + (vm.items.length + 1),
        image: `https://robohash.org/${vm.items.length + 1}.png`
    }, {
        title: 'Slide ' + (vm.items.length + 2),
        image: `https://robohash.org/${vm.items.length + 2}.png`
    }, {
        title: 'Slide ' + (vm.items.length + 3),
        image: `https://robohash.org/${vm.items.length + 3}.png`
    });
    */
}

export function navigate() {
    topmost().navigate('dummy-page');
}
