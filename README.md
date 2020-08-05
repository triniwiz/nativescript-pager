[![npm](https://img.shields.io/npm/v/nativescript-pager.svg)](https://www.npmjs.com/package/nativescript-pager)
[![npm](https://img.shields.io/npm/dt/nativescript-pager.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-pager)
[![Build Status](https://travis-ci.org/triniwiz/nativescript-pager.svg?branch=master)](https://travis-ci.org/triniwiz/nativescript-pager)

# NativeScript Pager

## Install

#### NativeScript 7x

- `tns plugin add @nativescript-community/ui-pager`

#### NativeScript 6x

- `tns plugin add nativescript-pager`

#### NativeScript 5x

- `tns plugin add nativescript-pager@9.x`

#### NativeScript 4x

- `tns plugin add nativescript-pager@8.0.2`

#### NativeScript 3x

- `tns plugin add nativescript-pager@7.2.3`

#### NativeScript 2x

- `tns plugin add nativescript-pager@2.3.0`

## Usage

**Note** v11+

```
Pager for NativeScript supports the core ObservableArray module part of the core NativeScript modules collection. Using an ObservableArray instance as a source for Pager will ensure that changes in the source collection will be automatically taken care of by the control.
````


IMPORTANT: Make sure you include `xmlns:pager="nativescript-pager"` on the Page element any element can be used in the pager

```xml
<pager:Pager items="{{items}}" row="2" id="pager" spacing="2%" peaking="10%" transformers="scale" pagesCount="10" showIndicator="true" backgroundColor="lightsteelblue">
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
<c:Pager selectedIndexChange="selectedIndexChange" itemTemplateSelector="$index % 2 === 0 ? 'even' : 'odd'" selectedIndex="5" items="{{items}}" row="4" id="pager" pagesCount="10" showIndicator="true" backgroundColor="lightsteelblue">
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

### Static Views

```xml
<c:Pager selectedIndexChange="selectedIndexChange" row="4" id="pager"
                 showIndicator="true" backgroundColor="lightsteelblue">
            <c:PagerItem backgroundColor="red">
                <Label text="First"></Label>
            </c:PagerItem>
            <c:PagerItem backgroundColor="white">
                <Label text="Second" ></Label>
            </c:PagerItem>
            <c:PagerItem backgroundColor="black">
                <Label text="Third" color="white"></Label>
            </c:PagerItem>
            <c:PagerItem backgroundColor="green">
                <Label text="Fourth"></Label>
            </c:PagerItem>
        </c:Pager>

```

### Vue

```js
import Vue from 'nativescript-vue';
import Pager from 'nativescript-pager/vue';

Vue.use(Pager);
```

```html
<template>
    <Pager for="item in items">
        <v-template>
            <GridLayout class="pager-item" rows="auto, *" columns="*">
                <Label :text="item.title" />
                <Image  stretch="fill" row="1" :src="item.image" />
            </GridLayout>
        </v-template>
        <v-template if="$odd">
            <GridLayout class="pager-item" rows="auto, *" columns="*">
                <Image  stretch="fill" :src="item.image" />
                <Label :text="item.title" row="1"/>
            </GridLayout>
        </v-template>
    </Pager>
</template>
```

### Static Views

```html
<Pager height="100%" :selectedIndex="1">
  <PagerItem backgroundColor="red"> <label text="First"></label> </PagerItem>
  <PagerItem backgroundColor="white"> <label text="Second"></label> </PagerItem>
  <PagerItem backgroundColor="black">
    <label text="Third" color="white"></label>
  </PagerItem>
  <PagerItem backgroundColor="green"> <label text="Fourth"></label> </PagerItem>
</Pager>
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
<Pager
  [items]="items"
  #pager
  [selectedIndex]="currentPagerIndex"
  (selectedIndexChange)="onIndexChanged($event)"
  class="pager"
>
  <template let-i="index" let-item="item">
    <GridLayout
      class="pager-item"
      rows="auto, *"
      columns="*"
      backgroundColor="red"
    >
      <label [text]="item.title"></label>
      <image row="1" [src]="item.image"></image>
    </GridLayout>
  </template>
</Pager>
```

_Angular v4+_

```html
<Pager
  [items]="items"
  #pager
  [selectedIndex]="currentPagerIndex"
  (selectedIndexChange)="onIndexChanged($event)"
  class="pager"
>
  <ng-template let-i="index" let-item="item">
    <GridLayout
      class="pager-item"
      rows="auto, *"
      columns="*"
      backgroundColor="red"
    >
      <label [text]="item.title"></label>
      <image row="1" [src]="item.image"></image>
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
<Pager
  row="1"
  [items]="items | async"
  [itemTemplateSelector]="templateSelector"
  #pager
  [selectedIndex]="currentPagerIndex"
  (selectedIndexChange)="onIndexChanged($event)"
  class="pager"
  backgroundColor="lightsteelblue"
>
  <ng-template pagerTemplateKey="even" let-i="index" let-item="item">
    <GridLayout class="pager-item" rows="auto,auto,*" columns="*">
      <label text="Even"></label> <label row="1" [text]="item.title"></label>
      <image loaded="loadedImage" row="2" [src]="item.image"></image>
    </GridLayout>
  </ng-template>

  <ng-template pagerTemplateKey="odd" let-i="index" let-item="item">
    <GridLayout
      class="pager-item"
      rows="auto,auto,auto,*"
      columns="*"
      backgroundColor="white"
    >
      <label text="Odd"></label> <label row="1" [text]="item.title"></label>
      <StackLayout row="2"> <label [text]="item.image"></label> </StackLayout>
      <image loaded="loadedImage" row="3" [src]="item.image"></image>
    </GridLayout>
  </ng-template>
</Pager>
```

### Static Views

```html
<Pager
  backgroundColor="orange"
  row="1"
  #pager
  [selectedIndex]="1"
  height="100%"
>
  <StackLayout *pagerItem backgroundColor="red">
    <label text="First"></label>
  </StackLayout>
  <StackLayout *pagerItem backgroundColor="white">
    <label text="Second"></label>
  </StackLayout>
  <StackLayout *pagerItem backgroundColor="black">
    <label text="Third" color="white"></label>
  </StackLayout>
  <StackLayout *pagerItem backgroundColor="green">
    <label text="Fourth"></label>
  </StackLayout>
</Pager>
```
### React

```typescript jsx
import {$Pager} from 'nativescript-pager/react';
return (
<$Pager
                height={{ unit: "%", value: 100 }}
                   selectedIndex={this.selectedIndex}
                   selectedIndexChange={this.selectedIndexChange.bind(this)}
                    items={this.items}
                     cellFactory={
                    (item, ref) => {
                        return (
                            <$StackLayout id={item.title} ref={ref}>
                                <$Label text={item.title}/>
                                <$ImageCacheIt stretch={'aspectFill'}
                                        src={item.image}/>
                            </$StackLayout>
                        );
                    }
                }/>
)
```

### Static Views

```typescript jsx
return(<$Pager row={0} col={0} selectedIndex={this.selectedIndex} height={{unit: '%', value: 100}}>
                           <$PagerItem backgroundColor={'red'}>
                               <$Label text={'First'}/>
                           </$PagerItem>
                           <$PagerItem backgroundColor={'white'}>
                               <$Label text={'Second'}/>
                           </$PagerItem>
                           <$PagerItem backgroundColor={'black'}>
                               <$Label text={'Third'} color={new Color('white')}/>
                           </$PagerItem>
                           <$PagerItem backgroundColor={'green'}>
                               <$Label text={'Fourth'}/>
                           </$PagerItem>
                           <$PagerItem backgroundColor={'pink'}>
                               <$Label text={'Fifth'}/>
                           </$PagerItem>
                       </$Pager>)

```






## Config

```xml
<Pager cache="false" disableSwipe="true" disableAnimation="true" selectedIndex="5">
```

| IOS                                     | Android                                      |
| --------------------------------------- | -------------------------------------------- |
| ![ios](https://i.imgur.com/mvkqXOa.gif) | ![android](https://i.imgur.com/LQgOZ0wh.gif) |
