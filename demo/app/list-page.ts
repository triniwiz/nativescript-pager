import { Page } from '@nativescript/core/ui/page';
import { HelloWorldModel } from './main-view-model';
import { Pager } from '@nativescript-community/ui-pager';
import { Image } from '@nativescript/core/ui/image';
import { topmost } from '@nativescript/core/ui/frame';

let page: Page;
let vm = new HelloWorldModel();

export function pageLoaded(args) {
    page = <Page>args.object;
    if (!args.isBackNavigation) {
        page.bindingContext = vm;
    }
}

export function toggleSwipe() {
    const pager: Pager = <Pager>page.getViewById('pager');
    pager.disableSwipe = !pager.disableSwipe;
}

export function goToPagerWithList(event) {
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

export function selectedIndexChange(event: any) {
    const selectedIndex = event.object.get('selectedIndex');
    // vm.set('index', event.object.get('selectedIndex'));


    if ((selectedIndex + 2) % 3 === 0) {
        vm.items.push({
            title: 'Slide ' + (vm.items.length + 1),
            image: 'https://source.unsplash.com/random'
        });
    }
}

export function navigate() {
    topmost().navigate('dummy-page');
}
