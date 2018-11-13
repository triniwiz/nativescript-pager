import { KeyedTemplate, Property, View } from 'tns-core-modules/ui/core/view';
import * as common from './pager.common';
import {
  ITEMLOADING,
  itemsProperty,
  itemTemplatesProperty,
  LOADMOREITEMS,
  PagerBase,
  selectedIndexProperty
} from './pager.common';

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
  private _disableAnimation: boolean;
  public pagesCount: number;

  public itemTemplateUpdated(oldData: any, newData: any): void {}

  private _android: android.support.v4.view.ViewPager;
  private _pagerAdapter: android.support.v4.view.PagerAdapter;
  private _views: Array<any>;
  private _transformer;
  private _pageListener: any;
  _viewMap: Map<string, View>;
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

  get disableAnimation(): boolean {
    return this._disableAnimation;
  }

  set disableAnimation(value: boolean) {
    this._disableAnimation = value;
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
      this._android.setCurrentItem(value, !this.disableAnimation);
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

  getItemPosition(obj) {
    return android.support.v4.view.PagerAdapter.POSITION_NONE;
  }

  instantiateItem(collection: android.view.ViewGroup, position: number) {
    if (!this.owner) {
      return null;
    }
    if (position === this.owner.items.length - 1) {
      this.owner.notify({ eventName: LOADMOREITEMS, object: this.owner });
    }
    const template = this.owner._getItemTemplate(position);
    if (this.owner._viewMap.has(`${position}-${template.key}`)) {
      const cachedView = this.owner._viewMap.get(`${position}-${template.key}`);
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
      this.owner._viewMap.set(`${position}-${template.key}`, view);
    }

    collection.addView(view.nativeView);
    return view.nativeView;
  }

  destroyItem(collection: android.view.ViewGroup, position: number, object) {
    const template = this.owner._getItemTemplate(position);
    if (this.owner._viewMap.has(`${position}-${template.key}`)) {
      let convertView: any = this.owner._viewMap.get(
        `${position}-${template.key}`
      )
        ? this.owner._viewMap.get(`${position}-${template.key}`)
        : null;
      if (convertView && convertView.nativeView) {
        collection.removeView(convertView.nativeView);
        this.owner._viewMap.delete(`${position}-${template.key}`);
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
  lastEventX;
  transformer: VerticalPageTransformer;
  constructor(context, owner: WeakRef<Pager>) {
    super(context);
    this.owner = owner;
    this.transformer = new VerticalPageTransformer();

    this.setPageTransformer(true, new VerticalPageTransformer());
    // The easiest way to get rid of the overscroll drawing that happens on the left and right
    this.setOverScrollMode(android.support.v4.view.ViewPager.OVER_SCROLL_NEVER);

    return global.__native(this);
  }

  swapXY(ev) {
    const width = this.getWidth();
    const height = this.getHeight();

    const newX = (ev.getY() / height) * width;
    const newY = (ev.getX() / width) * height;

    ev.setLocation(newX, newY);

    return ev;
  }

  onInterceptTouchEvent(ev) {
    const owner = this.owner.get();
    if (owner.disableSwipe) return false;
    const intercepted = super.onInterceptTouchEvent(this.swapXY(ev));
    this.swapXY(ev);
    return intercepted;
    //    return this.isSwipeAllowed(owner, ev) ? super.onInterceptTouchEvent(ev) : false;
  }

  onTouchEvent(ev) {
    const owner = this.owner.get();
    if (owner.disableSwipe) return false;
    return super.onTouchEvent(this.swapXY(ev));

    //  return this.isSwipeAllowed(owner, ev) ? super.onTouchEvent(ev) : false;
  }

  isSwipeAllowed(owner, ev) {
    const action = ev.getAction();
    if (action === android.view.MotionEvent.ACTION_DOWN) {
      this.lastEventX = ev.getX();
      return true;
    }

    if (action === android.view.MotionEvent.ACTION_MOVE) {
      const dx = ev.getX() - this.lastEventX;
      return dx > 0 ? owner.canGoLeft : owner.canGoRight;
    }

    return true;
  }
}

export class VerticalPageTransformer extends java.lang.Object
  implements android.support.v4.view.ViewPager.PageTransformer {
  constructor() {
    super();
    return global.__native(this);
  }

  public transformPage(view, position) {
    if (position < -1) {
      // [-Infinity,-1)
      // This page is way off-screen to the left.
      view.setAlpha(0);
    } else if (position <= 1) {
      // [-1,1]
      view.setAlpha(1);

      // Counteract the default slide transition
      view.setTranslationX(view.getWidth() * -position);

      // set Y position to swipe in from top
      const yPosition = position * view.getHeight();
      view.setTranslationY(yPosition);
    } else {
      // (1,+Infinity]
      // This page is way off-screen to the right.
      view.setAlpha(0);
    }
  }
}
