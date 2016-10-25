[![npm](https://img.shields.io/npm/v/nativescript-pager.svg)](https://www.npmjs.com/package/nativescript-pager)
[![npm](https://img.shields.io/npm/dt/nativescript-pager.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-pager)

#NativeScript Pager

##Install

`tns plugin add nativescript-pager`

##Usage

IMPORTANT: Make sure you include `xmlns:pager="nativescript-pager"` on the Page element any element can be used in the pager

```xml
<c:Pager id="pager">

<StackLayout>
<Label text="Slide 1"/>
<Image src="https://upload.wikimedia.org/wikipedia/en/5/59/Hulk_%28comics_character%29.png"/>
</StackLayout>

<StackLayout>
<Label text="Slide 2"/>
<Image src="https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg"/>
</StackLayout>

<StackLayout>
<Label text="Slide 3"/>
<Image src="http://static.srcdn.com/slir/w1000-h500-q90-c1000:500/wp-content/uploads/Batman-Begins-Batman-with-bats.jpg"/>
</StackLayout>

</c:Pager>
```

###AngularNative

```js
import {registerElement} from "nativescript-angular/element-registry";
registerElement("Pager", () => require("nativescript-pager").Pager);
```

```xml
<Pager>

<StackLayout>
<Label text="Slide 1"></Label>
<Image src="https://upload.wikimedia.org/wikipedia/en/5/59/Hulk_%28comics_character%29.png"></Image>
</StackLayout>

<StackLayout>
<Label text="Slide 2"></Label>
<Image src="https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg"></Image>
</StackLayout>

<StackLayout>
<Label text="Slide 3"></Label>
<Image src="http://static.srcdn.com/slir/w1000-h500-q90-c1000:500/wp-content/uploads/Batman-Begins-Batman-with-bats.jpg"></Image>
</StackLayout>

</Pager>
```

##Config

```xml
<Pager selectedIndex="5" transformer="FlipHorizontalTransformer">
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