[![npm](https://img.shields.io/npm/v/nativescript-pager.svg)](https://www.npmjs.com/package/nativescript-pager)
[![npm](https://img.shields.io/npm/dt/nativescript-pager.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-pager)
[![Build Status](https://travis-ci.org/triniwiz/nativescript-pager.svg?branch=master)](https://travis-ci.org/triniwiz/nativescript-pager)

# NativeScript Pager

## Install

`tns plugin add nativescript-pager`

## Usage

IMPORTANT: Make sure you include `xmlns:pager="nativescript-pager"` on the Page element any element can be used in the pager

```xml
<pager:Pager items="{{items}}" row="2" id="pager" pagesCount="10" showNativePageIndicator="false" backgroundColor="lightsteelblue">
            <pager:Pager.itemTemplate>
                <GridLayout rows="auto, *" columns="*" backgroundColor="red">
                    <Label text="{{title}}"/>
                    <Image row="1" src="{{image}}"/>
                </GridLayout>
            </pager:Pager.itemTemplate>
</pager:Pager>
```

### Multi Template

```xml
<c:Pager selectedIndexChange="selectedIndexChange" itemTemplateSelector="$index % 2 === 0 ? 'even' : 'odd'" selectedIndex="5" items="{{items}}" row="4" id="pager" pagesCount="10" showNativePageIndicator="false" backgroundColor="lightsteelblue">
      <Pager.itemTemplates>
        <template key="even">
          <GridLayout rows="auto,auto,*" columns="*">
            <Label text="Even"/>
            <Label row="1" text="{{title}}"/>
            <Image loaded="loadedImage" row="2" src="{{image}}"/>
          </GridLayout>
        </template>
        <template key="odd">
          <GridLayout rows="auto,auto ,auto,*" columns="*" backgroundColor="white">
            <Label text="Odd"/>
            <Label row="1" text="{{title}}"/>
            <StackLayout row="2">
              <Label text="{{image}}"/>
            </StackLayout>
            <Image loaded="loadedImage" row="3" src="{{image}}"/>
          </GridLayout>
        </template>
      </Pager.itemTemplates>
      <!-- <Pager.itemTemplate><GridLayout rows="auto,*" columns="*"><Label row="1" text="{{title}}"/><Image loaded="loadedImage" row="2" src="{{image}}"/></GridLayout></Pager.itemTemplate> -->
    </c:Pager>
```

### Angular

```js
import { PagerModule } from "nativescript-pager/angular";

@NgModule({
    imports: [
    PagerModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
```

_Angular v2_

```html
<Pager [items]="items" #pager [selectedIndex]="currentPagerIndex" (selectedIndexChanged)="onIndexChanged($event)" class="pager">
        <template let-i="index" let-item="item">
            <GridLayout class="pager-item" rows="auto, *" columns="*" backgroundColor="red">
                <Label  [text]="item.title"></Label>
                <Image row="1" [src]="item.image"></Image>
            </GridLayout>
        </template>
    </Pager>
```

_Angular v4+_

```html
<Pager [items]="items" #pager [selectedIndex]="currentPagerIndex" (selectedIndexChanged)="onIndexChanged($event)" class="pager">
        <ng-template let-i="index" let-item="item">
            <GridLayout class="pager-item" rows="auto, *" columns="*" backgroundColor="red">
                <Label  [text]="item.title"></Label>
                <Image row="1" [src]="item.image"></Image>
            </GridLayout>
        </ng-template>
    </Pager>
```

### Multi Template

```ts
 public templateSelector = (item: any, index: number, items: any) => {
    return index % 2 === 0 ? 'even' : 'odd';
  }
```

```html
<Pager row="1" [items]="items | async" [itemTemplateSelector]="templateSelector" #pager [selectedIndex]="currentPagerIndex" (selectedIndexChange)="onIndexChanged($event)" class="pager" backgroundColor="lightsteelblue">

        <ng-template pagerTemplateKey="even" let-i="index" let-item="item">
            <GridLayout class="pager-item" rows="auto,auto,*" columns="*">
                <Label text="Even"></Label>
                <Label row="1" [text]="item.title"></Label>
                <Image loaded="loadedImage" row="2" [src]="item.image"></Image>
            </GridLayout>
        </ng-template>

        <ng-template pagerTemplateKey="odd" let-i="index" let-item="item">
            <GridLayout class="pager-item" rows="auto,auto,auto,*" columns="*" backgroundColor="white">
                <Label text="Odd"></Label>
                <Label row="1" [text]="item.title"></Label>
                <StackLayout row="2">
                    <Label [text]="item.image"></Label>
                </StackLayout>
                <Image loaded="loadedImage" row="3" [src]="item.image" ></Image>
            </GridLayout>
        </ng-template>

    </Pager>
```

## Config

```xml
<Pager disableSwipe="true" selectedIndex="5">
```

| IOS                                    | Android                                    |
| ------------------------------------------ | ------------------------------------------ |
| ![ios](https://i.imgur.com/mvkqXOa.gif) | ![android](https://i.imgur.com/LQgOZ0wh.gif) |
