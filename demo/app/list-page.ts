import {
  EventData,
  PropertyChangeData
} from 'tns-core-modules/data/observable';
import { Page, NavigatedData } from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { Pager } from 'nativescript-pager';
import { Button } from 'tns-core-modules/ui/button';
import { Image } from 'tns-core-modules/ui/image';
import { topmost } from 'tns-core-modules/ui/frame';
import * as app from 'tns-core-modules/application';
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
export function pageLoaded() {}

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
