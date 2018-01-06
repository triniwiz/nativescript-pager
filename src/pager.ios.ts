import { View, layout, KeyedTemplate } from 'tns-core-modules/ui/core/view';
import { Label } from 'tns-core-modules/ui/label';
import { Color } from 'tns-core-modules/color';
import * as types from 'tns-core-modules/utils/types';
import { parse } from 'tns-core-modules/ui/builder';
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { ProxyViewContainer } from 'tns-core-modules/ui/proxy-view-container';
import {
  PagerBase,
  ITEMLOADING,
  itemsProperty,
  selectedIndexProperty,
  itemTemplatesProperty
} from './pager.common';

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
    ios: nativeView,
    android: undefined
  };
  owner.notify(args);
  return args;
}
import * as common from './pager.common';
global.moduleMerge(common, exports);

declare const ADTransitioningDelegate,
  ADCubeTransition,
  ADTransitioningViewController;

export class Pager extends PagerBase {
  private _disableSwipe: any;
  public itemTemplateUpdated(oldData: any, newData: any): void {}
  private _orientation: UIPageViewControllerNavigationOrientation;
  private _options: NSDictionary<any, any>;
  private _transformer;
  private _ios: UIPageViewController;
  private widthMeasureSpec: number;
  private heightMeasureSpec: number;
  private layoutWidth = 0;
  private layoutHeight = 0;
  private _viewMap: Map<number, View>;
  private cachedViewControllers: WeakRef<PagerView>[] = [];
  private delegate: PagerViewControllerDelegate;
  private dataSource: PagerDataSource;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: any;

  constructor() {
    super();
    this._viewMap = new Map();
    const that = new WeakRef(this);
    this._orientation = UIPageViewControllerNavigationOrientation.Horizontal;
    this._transformer = UIPageViewControllerTransitionStyle.Scroll;
    const nsVal = <any>[0.0];
    const nsKey = <any>[UIPageViewControllerOptionInterPageSpacingKey];
    this._options = NSDictionary.dictionaryWithObjectsForKeys(nsKey, nsVal);
    this._ios = UIPageViewController.alloc().initWithTransitionStyleNavigationOrientationOptions(
      this._transformer,
      this._orientation,
      this._options
    );
    this.delegate = PagerViewControllerDelegate.initWithOwner(that);
    this.nativeViewProtected = this._ios.view;
    this.dataSource = PagerDataSource.initWithOwner(new WeakRef(this));
  }

  get transformer() {
    return this._transformer;
  }

  eachChildView(callback: (child: View) => boolean): void {
    if (this._viewMap.size > 0) {
      this._viewMap.forEach((view, key) => {
        callback(view);
      });
    }
  }

  updateNativeIndex(oldIndex: number, newIndex: number) {
    this._navigateNativeViewPagerToIndex(oldIndex, newIndex);
  }

  updateNativeItems(oldItems: View[], newItems: View[]) {}

  refresh() {
    this._initNativeViewPager();
  }
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
    this.refresh();
  }

  getViewController(selectedIndex: number, refresh = false): UIViewController {
    let vc: PagerView;
    if (refresh) {
      this.cachedViewControllers[selectedIndex] = null;
    }
    if (this.cachedViewControllers[selectedIndex]) {
      this.prepareView(this._viewMap.get(selectedIndex));
      vc = this.cachedViewControllers[selectedIndex].get();
    }
    if (!vc) {
      vc = PagerView.initWithOwnerTag(new WeakRef(this), selectedIndex);
      let view: View;
      if (this.items && this.items.length) {
        view = this._getItemTemplate(selectedIndex).createView();
        let _args: any = notifyForItemAtIndex(
          this,
          view ? view.nativeView : null,
          view,
          ITEMLOADING,
          selectedIndex
        );
        view = _args.view || this._getDefaultItemContent(selectedIndex);

        if (view) {
          this.cachedViewControllers[selectedIndex] = new WeakRef(vc);
          this._prepareItem(view, selectedIndex);
          this._viewMap.set(selectedIndex, view);
        }
      } else {
        let lbl = new Label();
        lbl.text = 'Pager.items not set.';
        view = lbl;
      }
      if (!view.parent) {
        this._addView(view);
      }
      const nativeView = view.nativeView as UIView;
      if (!nativeView.superview) {
        vc.view.addSubview(view.nativeView);
      }
      this.prepareView(view);
    }

    return vc;
  }

  [itemsProperty.getDefault](): any {
    return null;
  }

  [itemsProperty.setNative](value: any[]) {
    selectedIndexProperty.coerce(this);
    this.refresh();
  }

  public onLoaded() {
    super.onLoaded();
    this.refresh();
    if (!this.disableSwipe) {
      this._ios.dataSource = this.dataSource;
    }
    this._ios.delegate = this.delegate;
    // const view = this._viewMap.get(this.selectedIndex);
    // this.prepareView(view);
    // const sv = this.nativeView.subviews[1];
    // if (this.borderRadius) {
    //     sv.layer.cornerRadius = this.borderRadius;
    // }
    // if (this.borderColor) {
    //     sv.layer.borderColor = new Color(this.borderColor).ios.CGColor;
    // }
    // if (this.backgroundColor) {
    //     sv.layer.backgroundColor = new Color(this.backgroundColor).ios.CGColor;
    // }
    // if (this.borderWidth) {
    //     sv.layer.borderWidth = this.borderWidth;
    // }
  }

  get disableSwipe(): boolean {
    return this._disableSwipe;
  }

  set disableSwipe(value: boolean) {
    this._disableSwipe = value;
    if (this._ios && value) {
      this._ios.dataSource = null;
    } else {
      this._ios.dataSource = this.dataSource;
    }
  }
  public onUnloaded() {
    this._ios.delegate = null;
    this._ios.dataSource = null;
    super.onUnloaded();
  }

  public disposeNativeView() {
    this._clearCachedItems();
    super.disposeNativeView();
  }

  private prepareView(view: View): void {
    if (
      this.widthMeasureSpec !== undefined &&
      this.heightMeasureSpec !== undefined
    ) {
      let result = View.measureChild(
        this,
        view,
        this.widthMeasureSpec,
        this.heightMeasureSpec
      );

      View.layoutChild(this, view, 0, 0, this.layoutWidth, this.layoutHeight);
    }
  }

  public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
    // console.log(`Pager.onMeasure: ${widthMeasureSpec}x${heightMeasureSpec}`)
    this.widthMeasureSpec = widthMeasureSpec;
    this.heightMeasureSpec = heightMeasureSpec;

    const width = layout.getMeasureSpecSize(widthMeasureSpec);
    const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
    const height = layout.getMeasureSpecSize(heightMeasureSpec);
    const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

    const view = this._viewMap.get(this.selectedIndex);
    let { measuredWidth, measuredHeight } = View.measureChild(
      this,
      view,
      widthMeasureSpec,
      heightMeasureSpec
    );
    // console.log(`Pager.onMeasure - measureChild = (${measuredWidth}x${measuredHeight})`);

    // Check against our minimum sizes
    measuredWidth = Math.max(measuredWidth, this.effectiveMinWidth);
    measuredHeight = Math.max(measuredHeight, this.effectiveMinHeight);

    const widthAndState = View.resolveSizeAndState(
      measuredWidth,
      width,
      widthMode,
      0
    );
    const heightAndState = View.resolveSizeAndState(
      measuredHeight,
      height,
      heightMode,
      0
    );
    this.setMeasuredDimension(widthAndState, heightAndState);
  }

  public onLayout(
    left: number,
    top: number,
    right: number,
    bottom: number
  ): void {
    super.onLayout(left, top, right, bottom);
    this.layoutWidth = right - left;
    this.layoutHeight = bottom - top;
    const view = this._viewMap.get(this.selectedIndex);
    View.layoutChild(this, view, 0, 0, this.layoutWidth, this.layoutHeight);
  }

  private _clearCachedItems() {
    if (!this.cachedViewControllers) {
      return;
    }

    this.cachedViewControllers.forEach(vcRef => {
      vcRef.clear();
    });

    this._viewMap.forEach((val, key) => {
      if (val && val.parent === this) {
        this._removeView(val);
      }
    });
    this._viewMap.clear();
  }

  _viewControllerRemovedFromParent(controller: PagerView): void {
    controller.tag = undefined;
    controller.view = undefined;
    controller.owner = undefined;
  }

  private _initNativeViewPager() {
    let controller = this.getViewController(this.selectedIndex, true);
    this._ios.setViewControllersDirectionAnimatedCompletion(
      <any>[controller],
      UIPageViewControllerNavigationDirection.Forward,
      false,
      null
    );
  }

  private _navigateNativeViewPagerToIndex(fromIndex: number, toIndex: number) {
    const vc = this.getViewController(toIndex);
    const view = this._viewMap.get(toIndex);
    this.prepareView(view);
    if (!vc) throw new Error('no VC');
    const direction =
      fromIndex < toIndex
        ? UIPageViewControllerNavigationDirection.Forward
        : UIPageViewControllerNavigationDirection.Reverse;
    this._ios.setViewControllersDirectionAnimatedCompletion(
      NSArray.arrayWithObject(vc),
      direction,
      true,
      null
    );
  }
}

class PagerViewControllerDelegate extends NSObject
  implements UIPageViewControllerDelegate {
  private _owner: WeakRef<Pager>;

  public static ObjCProtocols = [UIPageViewControllerDelegate];

  get owner(): Pager {
    return this._owner.get();
  }

  public static initWithOwner(
    owner: WeakRef<Pager>
  ): PagerViewControllerDelegate {
    let pv = new PagerViewControllerDelegate();
    pv._owner = owner;
    return pv;
  }

  pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted(
    pageViewController: UIPageViewController,
    finished: boolean,
    previousViewControllers: NSArray<any>,
    completed: boolean
  ) {
    if (finished) {
      let vc = <PagerView>pageViewController.viewControllers[0];
      const owner = this.owner;
      if (owner) {
        selectedIndexProperty.nativeValueChange(owner, vc.tag);
      }
    }
  }
}
class PagerDataSource extends NSObject
  implements UIPageViewControllerDataSource {
  private _owner: WeakRef<Pager>;

  public static ObjCProtocols = [UIPageViewControllerDataSource];

  get owner(): Pager {
    return this._owner.get();
  }

  public static initWithOwner(owner: WeakRef<Pager>): PagerDataSource {
    let ds = new PagerDataSource();
    ds._owner = owner;
    return ds;
  }

  pageViewControllerViewControllerBeforeViewController(
    pageViewController: UIPageViewController,
    viewControllerBefore: UIViewController
  ): UIViewController {
    let pos = (<PagerView>viewControllerBefore).tag;
    if (pos === 0 || !this.owner || !this.owner.items) {
      return null;
    } else {
      let prev = pos - 1;
      return this.owner.getViewController(prev);
    }
  }

  pageViewControllerViewControllerAfterViewController(
    pageViewController: UIPageViewController,
    viewControllerAfter: UIViewController
  ): UIViewController {
    let pos = (<PagerView>viewControllerAfter).tag;
    if (
      !this.owner ||
      !this.owner.items ||
      this.owner.items.length - 1 === pos
    ) {
      return null;
    } else {
      return this.owner.getViewController(pos + 1);
    }
  }

  presentationCountForPageViewController(
    pageViewController: UIPageViewController
  ): number {
    if (
      !this.owner ||
      !this.owner.items ||
      !this.owner.showNativePageIndicator
    ) {
      // Hide the native UIPageControl (dots)
      return -1;
    }
    return this.owner.items.length;
  }

  presentationIndexForPageViewController(
    pageViewController: UIPageViewController
  ): number {
    if (!this.owner || !this.owner.items) {
      return -1;
    }
    return this.owner.selectedIndex;
  }
}

export class PagerView extends UIViewController {
  owner: WeakRef<Pager>;
  tag: number;

  public static initWithOwnerTag(
    owner: WeakRef<Pager>,
    tag: number
  ): PagerView {
    let pv = new PagerView(null);
    pv.owner = owner;
    pv.tag = tag;
    return pv;
  }

  didMoveToParentViewController(parent: UIViewController): void {
    // console.log(`PagerView.didMoveToParentViewController`);
    let owner = this.owner ? this.owner.get() : null;
    if (!parent && owner) {
      // removed from parent
      // owner._viewControllerRemovedFromParent(this);
    }
  }
}
