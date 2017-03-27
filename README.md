[![npm](https://img.shields.io/npm/v/nativescript-pager.svg)](https://www.npmjs.com/package/nativescript-pager)
[![npm](https://img.shields.io/npm/dt/nativescript-pager.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-pager)

#NativeScript Pager

##Install

`tns plugin add nativescript-pager`

##Usage

IMPORTANT: Make sure you include `xmlns:pager="nativescript-pager"` on the Page element any element can be used in the pager

```xml
<c:Pager items="{{items}}" row="2" id="pager" pagesCount="10" showNativePageIndicator="false" backgroundColor="lightsteelblue">
            <Pager.itemTemplate>
                <GridLayout rows="auto, *" columns="*" backgroundColor="red">
                    <Label text="{{title}}"/>
                    <Image row="1" src="{{image}}"/>
                </GridLayout>
            </Pager.itemTemplate>
</c:Pager>
```

###AngularNative

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

```html
<Pager [items]="items" #pager [selectedIndex]="currentPagerIndex" (selectedIndexChanged)="onIndexChanged($event)" class="pager">
        <template pagerItemTemplate let-i="index" let-item="item">
            <GridLayout class="pager-item" rows="auto, *" columns="*" backgroundColor="red">
                <Label  [text]="item.title"></Label>
                <Image row="1" [src]="item.image"></Image>
            </GridLayout>
        </template>
    </Pager>
```


##Config

```xml
<Pager disableSwipe="true" selectedIndex="5" transformer="FlipHorizontalTransformer">
```


###Transformations
* AccordionTransformer
* BackgroundToForegroundTransformer
* CubeInTransformer
* CubeOutTransformer
* DefaultTransformer
* DepthPageTransformer
* DrawFromBackTransformer
* [FlipHorizontalTransformer](https://github.com/triniwiz/nativescript-pager/wiki/FlipHorizontalTransformer)
* FlipVerticalTransformer
* ForegroundToBackgroundTransformer
* ParallaxPageTransformer
* RotateDownTransformer
* RotateUpTransformer
* StackTransformer
* TabletTransformer
* ZoomInTransformer
* ZoomOutSlideTransformer
* ZoomOutTranformer


Android |
--------|
![android](screenshots/pager.gif?raw=true) |