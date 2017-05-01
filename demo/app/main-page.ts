import { EventData, PropertyChangeData } from 'data/observable';
import { Page, NavigatedData } from 'ui/page';
import { HelloWorldModel } from './main-view-model';
import { Pager } from "nativescript-pager";
import { Button } from "ui/button";
import { Image } from "ui/image";
import { topmost } from "ui/frame";
import * as app from "application";
let page: Page;
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: NavigatedData) {
  // Get the event sender
  page = <Page>args.object;
  if (!args.isBackNavigation) {
    page.bindingContext = new HelloWorldModel();
  }
}
export function pageLoaded() {
}

export function prevPage() {
  const pager: Pager = <Pager>page.getViewById("pager");
  --pager.selectedIndex;
}

export function nextPage() {
  const pager: Pager = <Pager>page.getViewById("pager");
  ++pager.selectedIndex;
}

export function firstPage() {
  const pager: Pager = <Pager>page.getViewById("pager");
  pager.selectedIndex = 0;
}

export function lastPage() {
  const pager: Pager = <Pager>page.getViewById("pager");
  pager.selectedIndex = pager.items.length - 1;
}

export function loadedImage($event: any) {
  const image: Image = $event.object;
  console.log(`onLoaded: ${image}, size: ${JSON.stringify(image.getActualSize())}}`);
}

export function navigate() {
  topmost().navigate("dummy-page");
}