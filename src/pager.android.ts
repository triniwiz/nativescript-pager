import { View, Property, KeyedTemplate } from 'tns-core-modules/ui/core/view';
import { ContentView } from 'tns-core-modules/ui/content-view';
import * as types from 'tns-core-modules/utils/types';
import * as app from 'tns-core-modules/application';
import { parse } from 'tns-core-modules/ui/builder';
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import {
  PagerBase,
  selectedIndexProperty,
  itemsProperty,
  ITEMLOADING,
  itemTemplatesProperty,
  LOADMOREITEMS
} from './pager.common';
import * as common from './pager.common';
global.moduleMerge(common, exports);
function notifyForItemAtIndex(
  owner,
  nativeView: any,
  view: any,
  eventName: string,
  index: number
) {
  let args = {
    eventName: eventName,
    object: owner,
    index: index,
    view: view,
    ios: undefined,
    android: nativeView
  };
  owner.notify(args);
  return args;
}

declare namespace com.eftimoff {
  export const viewpagertransformers: any;
}

export class Pager extends PagerBase {
  _androidViewId: number;
  disableSwipe: boolean;
  public pagesCount: number;
  public itemTemplateUpdated(oldData: any, newData: any): void {}
  private _android: android.support.v4.view.ViewPager;
  private _pagerAdapter: android.support.v4.view.PagerAdapter;
  private _views: Array<any>;
  private _transformer;
  private _pageListener: any;
  _viewMap: Map<number, View>;
  public _realizedItems = new Map<android.view.View, View>();
  public _realizedTemplates = new Map<string, Map<android.view.View, View>>();
  constructor() {
    super();
  }

  get views() {
    return this._views;
  }
  set views(value: Array<any>) {
    this._views = value;
  }

  get android() {
    return this._android;
  }

  // get pagesCount() {
  //     return this._getValue(Pager.pagesCountProperty);
  // }
  // set pagesCount(value: number) {
  //     this._setValue(Pager.pagesCountProperty, value);
  // }

  public createNativeView(): android.support.v4.view.ViewPager {
    const that = new WeakRef(this);
    this._viewMap = new Map();
    this._android = new TNSViewPager(this._context, that);
    this._pageListener = new android.support.v4.view.ViewPager.OnPageChangeListener(
      {
        onPageSelected: function(position: number) {
          const owner = that.get();
          if (owner) {
            owner.selectedIndex = position;
          }
        },
        onPageScrolled: function(
          position,
          positionOffset,
          positionOffsetPixels
        ) {},
        onPageScrollStateChanged: function(state) {}
      }
    );
    this._pagerAdapter = new PagerAdapter(this);

    if (this.transformer) {
      this._android.setPageTransformer(false, new this._transformer());
    }
    if (this.pagesCount > 0) {
      this._android.setOffscreenPageLimit(this.pagesCount);
    }

    this._android.setClipToPadding(false);
    if (this.pageSpacing) {
      this._android.setPageMargin(this.pageSpacing);
    }
    return this._android;
  }

  public initNativeView() {
    super.initNativeView();
    this._android.setOnPageChangeListener(this._pageListener);
    this._android.setAdapter(this._pagerAdapter);
    if (this._androidViewId < 0) {
      this._androidViewId = android.view.View.generateViewId();
    }
    this.nativeView.setId(this._androidViewId);
  }

  get pagerAdapter() {
    return this._pagerAdapter;
  }

  get _childrenCount(): number {
    return this.items ? this.items.length : 0;
  }

  [itemsProperty.getDefault](): any {
    return null;
  }

  [itemsProperty.setNative](value: any) {
    if (value) {
      selectedIndexProperty.coerce(this);
      this.refresh();
    }
  }

  [selectedIndexProperty.setNative](value: number) {
    if (this._android) {
      this._android.setCurrentItem(value, true);
    }
  }

  refresh(hardReset = false) {
    if (this._android && this._pagerAdapter) {
      this._pagerAdapter.notifyDataSetChanged();
    }
  }

  updatePagesCount(value: number) {
    if (this._android) {
      this._pagerAdapter.notifyDataSetChanged();
      this._android.setOffscreenPageLimit(value);
    }
  }

  updateNativeIndex(oldIndex: number, newIndex: number) {}

  updateNativeItems(oldItems: Array<View>, newItems: Array<View>) {
    this.refresh();
  }

  onUnloaded() {
    // this._android.setAdapter(null);
    super.onUnloaded();
  }

  public disposeNativeView() {
    this._viewMap.clear();
    super.disposeNativeView();
  }

  eachChildView(callback: (child: View) => boolean): void {
    if (this._viewMap && this._viewMap.size > 0) {
      this._viewMap.forEach((view, key) => {
        callback(view);
      });
    }
  }

  set transformer(value) {
    switch (value) {
      case 'AccordionTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.AccordionTransformer;
        break;
      case 'BackgroundToForegroundTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.BackgroundToForegroundTransformer;
        break;
      case 'CubeInTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.CubeInTransformer;
        break;
      case 'CubeOutTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.CubeOutTransformer;
        break;
      case 'DefaultTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.DefaultTransformer;
        break;
      case 'DepthPageTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.DepthPageTransformer;
        break;
      case 'DrawFromBackTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.DrawFromBackTransformer;
        break;
      case 'FlipHorizontalTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.FlipHorizontalTransformer;
        break;
      case 'FlipVerticalTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.FlipVerticalTransformer;
        break;
      case 'ForegroundToBackgroundTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.ForegroundToBackgroundTransformer;
        break;
      case 'RotateDownTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.RotateDownTransformer;
        break;
      case 'RotateUpTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.RotateUpTransformer;
        break;
      case 'StackTransformer':
        this._transformer = com.eftimoff.viewpagertransformers.StackTransformer;
        break;
      case 'TabletTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.TabletTransformer;
        break;
      case 'ZoomInTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.ZoomInTransformer;
        break;
      case 'ZoomOutSlideTransformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.ZoomOutSlideTransformer;
        break;
      case 'ZoomOutTranformer':
        this._transformer =
          com.eftimoff.viewpagertransformers.ZoomOutTranformer;
        break;
    }
  }

  get transformer() {
    return this._transformer;
  }

  updateAdapter() {
    this._pagerAdapter.notifyDataSetChanged();
  }

  _selectedIndexUpdatedFromNative(newIndex: number) {}

  [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
    return null;
  }
  [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
    this._itemTemplatesInternal = new Array<KeyedTemplate>(
      this._defaultTemplate
    );
    if (value) {
      this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
    }
    this._pagerAdapter = new PagerAdapter(this);
    this.nativeViewProtected.setAdapter(this._pagerAdapter);
    this.refresh();
  }
}

export const pagesCountProperty = new Property<Pager, number>({
  name: 'pagesCount',
  valueChanged: (pager: Pager, oldValue, newValue) => {
    pager.updatePagesCount(pager.pagesCount);
  }
});
pagesCountProperty.register(Pager);

export class PagerAdapter extends android.support.v4.view.PagerAdapter {
  private owner: Pager;
  constructor(owner) {
    super();
    this.owner = owner;
    return global.__native(this);
  }

  instantiateItem(collection: android.view.ViewGroup, position: number) {
    if (!this.owner) {
      return null;
    }
    if (position === this.owner.items.length - 1) {
      this.owner.notify({ eventName: LOADMOREITEMS, object: this.owner });
    }
    const template = this.owner._getItemTemplate(position);
    if (this.owner._viewMap.has(position)) {
      const cachedView = this.owner._viewMap.get(position);
      let convertView = cachedView ? cachedView.nativeView : null;
      if (convertView) {
        // collection.addView(convertView);
        return convertView;
      }
    }
    let view: any = template.createView();
    let _args: any = notifyForItemAtIndex(
      this.owner,
      view ? view.nativeView : null,
      view,
      ITEMLOADING,
      position
    );
    view = _args.view || this.owner._getDefaultItemContent(position);
    if (view) {
      this.owner._prepareItem(view, position);
      if (!view.parent) {
        this.owner._addView(view);
      }
      this.owner._viewMap.set(position, view);
    }

    collection.addView(view.nativeView);
    return view.nativeView;
  }

  destroyItem(collection: android.view.ViewGroup, position: number, object) {
    if (this.owner._viewMap.has(position)) {
      let convertView: any = this.owner._viewMap.get(position)
        ? this.owner._viewMap.get(position)
        : null;
      if (convertView && convertView.nativeView) {
        collection.removeView(convertView.nativeView);
        this.owner._viewMap.delete(position);
      }
    }
  }

  getCount() {
    return this.owner.items ? this.owner.items.length : 0;
  }

  isViewFromObject(view: android.view.View, object) {
    return view === object;
  }
}

export class TNSViewPager extends android.support.v4.view.ViewPager {
  disableSwipe: boolean;
  owner: WeakRef<Pager>;
  constructor(context, owner: WeakRef<Pager>) {
    super(context);
    this.owner = owner;
    return global.__native(this);
  }

  onInterceptTouchEvent(ev) {
    const owner = this.owner.get();
    const disableSwipe = owner.disableSwipe;
    if (disableSwipe) {
      return false;
    } else {
      return super.onInterceptTouchEvent(ev);
    }
  }

  onTouchEvent(ev) {
    const owner = this.owner.get();
    const disableSwipe = owner.disableSwipe;
    if (disableSwipe) {
      return false;
    } else {
      return super.onTouchEvent(ev);
    }
  }
}
