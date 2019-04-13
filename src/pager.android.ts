import { KeyedTemplate, Property, View, layout } from 'tns-core-modules/ui/core/view';
import * as common from './pager.common';
import {
    ITEMLOADING,
    itemsProperty,
    itemTemplatesProperty,
    LOADMOREITEMS,
    PagerBase,
    peakingProperty,
    Orientation,
    orientationProperty,
    selectedIndexProperty,
    spacingProperty,
    Transformer,
    PagerItem
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

declare var java, android;
export { Transformer } from './pager.common';

export class Pager extends PagerBase {
    nativeViewProtected: android.support.v4.view.ViewPager;
    _androidViewId: number;
    private _disableAnimation: boolean;
    public pagesCount: number;
    widthMeasureSpec: number;
    heightMeasureSpec: number;
    public perPage: number;
    private _transformer: Transformer = Transformer.NONE;

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    _pagerAdapter: PagerStateAdapter;
    private _views: Array<any>;
    private _pageListener: any;
    _viewMap: Map<string, View>;
    public _realizedItems = new Map<any /*android.view.View*/, View>();
    public _realizedTemplates = new Map<string, Map<any /*android.view.View*/, View>>();
    private lastEvent = 0;
    constructor() {
        super();
        pagers.set(this._domId, new WeakRef<Pager>(this));
        this._childrenViews = new Map<number, View>();
    }

    get views() {
        return this._views;
    }

    set views(value: Array<any>) {
        this._views = value;
    }

    get android() {
        return this.nativeViewProtected;
    }

    // get pagesCount() {
    //     return this._getValue(Pager.pagesCountProperty);
    // }
    // set pagesCount(value: number) {
    //     this._setValue(Pager.pagesCountProperty, value);
    // }

    public createNativeView() {
        const that = new WeakRef(this);
        let view;
        this._viewMap = new Map();
        if (this.orientation === 'vertical') {
            initTNSVerticalViewPager();
            view = new TNSVerticalViewPager(this._context);
        } else {
            initTNSViewPager();
            view = new TNSViewPager(this._context);
        }

        view.owner = that;
        this._pageListener = new android.support.v4.view.ViewPager.OnPageChangeListener(
            {
                onPageSelected: function (position: number) {
                    const owner = that.get();
                    if (owner) {
                        owner.selectedIndex = position;
                        owner.notify({
                            eventName: Pager.swipeEvent,
                            object: owner
                        });
                    }
                },
                onPageScrolled: function (
                    position,
                    positionOffset,
                    positionOffsetPixels
                ) {
                    const owner = that.get();
                    if (owner) {
                        owner.notify({
                            eventName: Pager.scrollEvent,
                            object: owner,
                            selectedIndex: position,
                            scrollX: owner.horizontalOffset,
                            scrollY: owner.verticalOffset
                        });
                    }
                },
                onPageScrollStateChanged: function (state) {
                    const owner = that.get();
                    if (owner) {
                        if (owner.lastEvent === 0 && state === 1) {
                            owner.notify({
                                eventName: Pager.swipeStartEvent,
                                object: owner
                            });
                            owner.lastEvent = 1;
                        } else if (owner.lastEvent === 1 && state === 1) {
                            owner.notify({
                                eventName: Pager.swipeOverEvent,
                                object: owner
                            });
                            owner.lastEvent = 1;
                        } else if (owner.lastEvent === 1 && state === 2) {
                            owner.notify({
                                eventName: Pager.swipeEndEvent,
                                object: owner
                            });
                            owner.lastEvent = 2;
                        }else{
                            owner.lastEvent = 0;
                        }
                    }
                }
            }
        );

        initPagerStateAdapter();
        this._pagerAdapter =  new PagerStateAdapter();
        this._pagerAdapter.mFragmentManager = (this as any)._getFragmentManager();
        this._pagerAdapter.owner = new WeakRef(this);

        if (this.pagesCount > 0) {
            view.setOffscreenPageLimit(this.pagesCount);
        } else {
            view.setOffscreenPageLimit(3);
        }


        return view;
    }

    onLayoutChange(args: any) {
        const spacing = this.convertToSize(args.object.spacing);
        const peaking = this.convertToSize(args.object.peaking);
        if (spacing > 0 && peaking > 0) {
            this.nativeViewProtected.setClipToPadding(false);
            this.nativeViewProtected.setPadding(peaking, 0, peaking, 0);
            this.nativeViewProtected.setPageMargin(spacing / 2);
        }
    }

    [spacingProperty.setNative](value: any) {
        const size = this.convertToSize(value);
        if (size > 0) {
            this.nativeViewProtected.setClipToPadding(false);
            this.nativeViewProtected.setClipChildren(false);
            this.nativeViewProtected.setPageMargin(size / 2);
        }
    }

    [peakingProperty.setNative](value: any) {
        const size = this.convertToSize(value);
        if (size > 0) {
            this.nativeViewProtected.setClipToPadding(false);
            this.nativeViewProtected.setClipChildren(false);
            this.nativeViewProtected.setPadding(size, 0, size, 0);
        }
    }


    public initNativeView() {
        super.initNativeView();
        this.on(View.layoutChangedEvent, this.onLayoutChange, this);
        this.nativeViewProtected.setOnPageChangeListener(this._pageListener);
        this.nativeViewProtected.setAdapter(this._pagerAdapter);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        if (this.pagesCount > 0) {
            this.nativeViewProtected.setOffscreenPageLimit(this.pagesCount);
        }
        this.nativeView.setId(this._androidViewId);

        if (this._transformer === 'scale') {
            initZoomOutPageTransformer();
            const transformer = new ZoomOutPageTransformer();
            transformer.owner = new WeakRef<Pager>(this);
            this.nativeViewProtected.setPageTransformer(true, transformer);
        }

    }

    public disposeNativeView() {
        this.off(View.layoutChangedEvent, this.onLayoutChange, this);
        this._viewMap.clear();
        this._pageListener = null;
        this._pagerAdapter = null;
        super.disposeNativeView();
    }

    get disableAnimation(): boolean {
        return this._disableAnimation;
    }

    set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    get pagerAdapter() {
        return this._pagerAdapter as com.lambergar.verticalviewpager.PagerAdapter;
    }

    get _childrenCount(): number {
        return this.items ? this.items.length : this._childrenViews ? this._childrenViews.size : 0;
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

    get transformer() {
        return this._transformer;
    }

    set transformer(value: Transformer) {
        if (this.nativeViewProtected) {
            if (value === 'scale') {
                initZoomOutPageTransformer();
                const transformer = new ZoomOutPageTransformer();
                transformer.owner = new WeakRef<Pager>(this);
                this.nativeViewProtected.setPageTransformer(true, transformer);
            }
        }
        this._transformer = value;
    }

    onLoaded(): void {
        super.onLoaded();
        if (!this.items && this._childrenCount > 0) {
            selectedIndexProperty.coerce(this);
            setTimeout(() => {
                this.nativeViewProtected.setCurrentItem(this.selectedIndex, false);
            }, 0);
        }
    }

    [selectedIndexProperty.setNative](value: number) {
        if (this.nativeViewProtected) {
            this.nativeViewProtected.setCurrentItem(value, !this.disableAnimation);
        }
    }

    public scrollToIndexAnimated(index: number, animate: boolean) {
        if (this.nativeViewProtected) {
            this.nativeViewProtected.setCurrentItem(index, animate);
        }
    }

    refresh() {
        if (this.nativeViewProtected && this._pagerAdapter) {
            this.nativeViewProtected.getAdapter().notifyDataSetChanged();
        }
    }

    updatePagesCount(value: number) {
        if (this.nativeViewProtected) {
            this._pagerAdapter.notifyDataSetChanged();
            this.nativeViewProtected.setOffscreenPageLimit(value);
        }
    }

    updateNativeIndex(oldIndex: number, newIndex: number) {
    }

    updateNativeItems(oldItems: Array<View>, newItems: Array<View>) {
        this.refresh();
    }

    onUnloaded() {
        // this._android.setAdapter(null);
        super.onUnloaded();
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

    _selectedIndexUpdatedFromNative(newIndex: number) {
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
        this._pagerAdapter = new PagerStateAdapter();
        this._pagerAdapter.mFragmentManager = (this as any)._getFragmentManager();
        this._pagerAdapter.owner = new WeakRef(this);
        this.nativeViewProtected.setAdapter(this._pagerAdapter);
        this.refresh();
    }

    _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof  PagerItem) {
            this._childrenViews.set(this._childrenCount, value);
        }
    }
    // public [orientationProperty.setNative](value: Orientation) {
    //     if (value === 'horizontal') {
    //         this.android.verticalScrolling = false;
    //     } else {
    //         this.android.verticalScrolling = true;
    //     }
    // }

    get horizontalOffset(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return 0;
        }

        return nativeView.getScrollX() / layout.getDisplayDensity();
    }

    get verticalOffset(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return 0;
        }

        return nativeView.getScrollY() / layout.getDisplayDensity();
    }

}

export const pagesCountProperty = new Property<Pager, number>({
    name: 'pagesCount',
    defaultValue: 0,
    valueChanged: (pager: Pager, oldValue, newValue) => {
        pager.updatePagesCount(pager.pagesCount);
    }
});
pagesCountProperty.register(Pager);

const pagers = new Map<number, WeakRef<Pager>>();
const getPagerById = (id: number) => {
    return pagers.get(id);
};


const POSITION_UNCHANGED = -1;
const POSITION_NONE = -2;

export class PagerFragment extends android.support.v4.app.Fragment {
    owner: WeakRef<Pager>;
    position: number = -1;
    view: View;

    constructor() {
        super();
        return global.__native(this);
    }

    public static newInstance(pagerId: number, position: number) {
        const fragment = new PagerFragment();
        fragment.position = position;
        fragment.owner = getPagerById(pagerId);
        const args = new android.os.Bundle();
        args.putInt('position', position);
        args.putInt('pagerId', pagerId);
        fragment.setArguments(args);
        return fragment;
    }

    onCreateView(inflater: any /*android.view.LayoutInflater*/, collection: any /*android.view.ViewGroup*/, bundle: any /* android.os.Bundle */): any /* android.view.View */ {
        if (!this.owner || this.position === -1) {
            return null;
        }
        const owner = this.owner.get();
        if (owner && owner._childrenCount > 0 && !owner.items) {
            const view = owner._childrenViews.get(this.position);
            if (view) {
                if (!view.parent) {
                    owner._addView(view);
                }
            }
            this.view = view;
            if (view.nativeView && !view.nativeView.getParent()) {
                owner.nativeViewProtected.addView(view.nativeView);
            }
            return view.nativeView;
        }

        if (owner.items && this.position === owner.items.length - owner.loadMoreCount) {
            owner.notify({eventName: LOADMOREITEMS, object: owner});
        }
        const template = owner._getItemTemplate(this.position);
        if (!owner.cache && owner._viewMap.has(`${this.position}-${template.key}`)) {
            const cachedView = owner._viewMap.get(`${this.position}-${template.key}`);
            this.view = cachedView;
            return cachedView ? cachedView.nativeView : null;
        }
        let view: any = template.createView();
        let _args: any = notifyForItemAtIndex(
            owner,
            view ? view.nativeView : null,
            view,
            ITEMLOADING,
            this.position
        );
        view = _args.view || owner._getDefaultItemContent(this.position);
        if (view) {
            owner._prepareItem(view, this.position);
            if (!view.parent) {
                owner._addView(view);
            }
            owner._viewMap.set(`${this.position}-${template.key}`, view);
        }
        this.view = view;
        if (view.nativeView && !view.nativeView.getParent()) {
            owner.nativeViewProtected.addView(view.nativeView);
        }
        view.nativeView.setId(this.position); //android.view.View.generateViewId()

        return view.nativeView;
    }

    public onDestroyView() {
        super.onDestroyView();
    }
}

let PagerStateAdapter: PagerStateAdapter;
interface PagerStateAdapter extends com.lambergar.verticalviewpager.PagerAdapter {
    new (): PagerStateAdapter;
    mFragmentManager: android.support.v4.app.FragmentManager;
    owner: WeakRef<Pager>;
}
function initPagerStateAdapter() {
class PagerStateAdapterImpl extends com.lambergar.verticalviewpager.PagerAdapter {
        owner: WeakRef<Pager>;
        mFragmentManager: any /*android.support.v4.app.FragmentManager*/;
        mCurTransaction: any /*android.support.v4.app.FragmentTransaction*/;
        mCurrentPrimaryItem: any;
        mFragments: any /*android.support.v4.util.LongSparseArray<number>*/;
        mSavedStates: any /*android.support.v4.util.LongSparseArray<any>*/;

        constructor() {
            super();
            this.mFragments = new android.support.v4.util.LongSparseArray();
            this.mSavedStates = new android.support.v4.util.LongSparseArray();
            return global.__native(this);
        }

        startUpdate(container: any /*android.view.ViewGroup*/): void {
            if (container.getId() === android.view.View.NO_ID) {
                throw new Error('ViewPager with adapter ' + this
                    + ' requires a view id');
            }
        }

        registerDataSetObserver(param0: any /*android.database.DataSetObserver*/): void {
            super.registerDataSetObserver(param0);
        }

        getPageWidth(position) {
            const owner = this.owner ? this.owner.get() : null;
            if (owner && owner.orientation === 'horizontal') {
                return float(1.0 / owner.perPage);
            }
            return float(1.0);
        }
        getPageHeight(position) {
            const owner = this.owner ? this.owner.get() : null;
            if (owner && owner.orientation === 'vertical') {
                return float(1.0 / owner.perPage);
            }
            return float(1.0);
        }

        unregisterDataSetObserver(param0: any /*android.database.DataSetObserver*/): void {
            super.unregisterDataSetObserver(param0);
        }

        instantiateItem(container: any /*android.view.ViewGroup*/, position: number): any {
            const tag = this.getItemId(position);
            let fragment = this.mFragments.get(tag);
            // If we already have this item instantiated, there is nothing
            // to do.  This can happen when we are restoring the entire pager
            // from its saved state, where the fragment manager has already
            // taken care of restoring the fragments we previously had instantiated.
            if (fragment != null) {
                return fragment;
            }

            const owner = this.owner ? this.owner.get() : null;
            if (owner) {
                if (owner.items && position === owner.items.length - 1) {
                    owner.notify({eventName: LOADMOREITEMS, object: owner});
                }
            }

            if (this.mCurTransaction == null) {
                this.mCurTransaction = this.mFragmentManager.beginTransaction();
                this.mCurTransaction.setReorderingAllowed(true);
            }

            fragment = this.getItem(position);
            // restore state
            const savedState = this.mSavedStates.get(tag);
            if (savedState != null) {
                fragment.setInitialSavedState(savedState);
            }
            fragment.setMenuVisibility(false);
            fragment.setUserVisibleHint(false);
            this.mFragments.put(tag, fragment);
            this.mCurTransaction.add(container.getId(), fragment, 'f' + tag);

            const cachedView = this.getViewByPosition(position);

            if (owner && cachedView) {
                owner._prepareItem(cachedView, position);
            }
            if (cachedView && cachedView.nativeView && !cachedView.nativeView.getParent() && container) {
                container.addView(cachedView.nativeView);
            }
            return fragment;
        }

        destroyItem(container: any /*android.view.ViewGroup*/, position: number, object: any): void {
            let fragment = /*<android.support.v4.app.Fragment>*/object;
            const currentPosition = this.getItemPosition(fragment);

            const index = this.mFragments.indexOfValue(fragment);
            let fragmentKey = -1;
            if (index !== -1) {
                fragmentKey = this.mFragments.keyAt(index);
                this.mFragments.removeAt(index);
            }

            // item hasn't been removed
            if (fragment.isAdded() && currentPosition !== android.support.v4.view.PagerAdapter.POSITION_NONE) {
                this.mSavedStates.put(fragmentKey, this.mFragmentManager.saveFragmentInstanceState(fragment));
            } else {
                this.mSavedStates.remove(fragmentKey);
            }

            if (this.mCurTransaction == null) {
                this.mCurTransaction = this.mFragmentManager.beginTransaction();
            }

            const cachedView = this.getViewByPosition(position);
            if (cachedView && cachedView.nativeView && cachedView.nativeView.getParent() && container) {
                container.removeView(cachedView.nativeView);
            }

            const owner = this.owner.get();

            if (owner && cachedView) {
                const template = owner._getItemTemplate(position);
                owner._viewMap.delete(`${position}-${template.key}`);
            }

            this.mCurTransaction.remove(fragment);
        }

        setPrimaryItem(container: any /*android.view.ViewGroup*/, position: number, object: any): void {
            const fragment = <android.support.v4.app.Fragment>object;
            if (fragment !== this.mCurrentPrimaryItem) {
                if (this.mCurrentPrimaryItem != null) {
                    this.mCurrentPrimaryItem.setMenuVisibility(false);
                    this.mCurrentPrimaryItem.setUserVisibleHint(false);
                }
                if (fragment != null) {
                    fragment.setMenuVisibility(true);
                    fragment.setUserVisibleHint(true);
                }
                this.mCurrentPrimaryItem = fragment;
                const cachedView = this.getViewByPosition(position);
                if (cachedView && cachedView.nativeView && !cachedView.nativeView.getParent() && container) {
                    container.addView(cachedView.nativeView);
                }
            }
        }

        private getViewByPosition(position: number): View {
            let cachedView = null;
            const owner = this.owner.get();


            if (owner && owner._childrenCount > 0 && !owner.items) {
                return owner._childrenViews.get(position);
            }

            const template = owner._getItemTemplate(position);
            if (owner._viewMap.has(`${position}-${template.key}`)) {
                cachedView = <View>owner._viewMap.get(`${position}-${template.key}`);
            }
            return cachedView;
        }

        finishUpdate(container: any /*android.view.ViewGroup*/): void {
            if (this.mCurTransaction != null) {
                this.mCurTransaction.commitNowAllowingStateLoss();
                this.mCurTransaction = null;
            }
        }

        getCount(): number {
            const owner = this.owner ? this.owner.get() : null;
            if (!owner) return 0;
            return owner.items ? owner.items.length : owner._childrenCount;
        }

        getItem(position: number): PagerFragment {
            if (!this.owner) {
                return null;
            }
            const owner = this.owner.get();
            return PagerFragment.newInstance(owner._domId, position);
        }

        saveState(): any /*android.os.Parcelable*/ {
            let state = null;
            if (this.mSavedStates.size() > 0) {
                // save Fragment states
                state = new android.os.Bundle();
                let stateIds = Array.create('long', this.mSavedStates.size());
                for (let i = 0; i < this.mSavedStates.size(); i++) {
                    const entry = this.mSavedStates.valueAt(i);
                    stateIds[i] = this.mSavedStates.keyAt(i);
                    state.putParcelable(java.lang.Long.toString(stateIds[i]), entry);
                }
                state.putLongArray('states', stateIds);
            }
            for (let i = 0; i < this.mFragments.size(); i++) {
                const f = this.mFragments.valueAt(i);
                if (f != null && f.isAdded()) {
                    if (state == null) {
                        state = new android.os.Bundle();
                    }
                    const key = 'f' + this.mFragments.keyAt(i);
                    this.mFragmentManager.putFragment(state, key, f);
                }
            }
            return state;

        }

        restoreState(state: any /*android.os.Parcelable*/, loader: any /*java.lang.ClassLoader*/): void {
            if (state != null) {
                const bundle = <android.os.Bundle>state;
                bundle.setClassLoader(loader);
                const fss = bundle.getLongArray('states');
                this.mSavedStates.clear();
                this.mFragments.clear();
                if (fss != null) {
                    const size = fss.length;
                    for (let i = 0; i < size; i++) {
                        const fs = fss[i];
                        this.mSavedStates.put(fs, bundle.getParcelable(java.lang.Long.toString(fs)));
                    }
                }
                const keys = bundle.keySet();
                const keysArray = keys.toArray();
                const keysSize = keys.size();
                for (let i = 0; i < keysSize; i++) {
                    const key = keysArray[i];
                    if (key.startsWith('f')) {
                        const f = this.mFragmentManager.getFragment(bundle, key);
                        if (f != null) {
                            f.setMenuVisibility(false);
                            this.mFragments.put(java.lang.Long.parseLong(key.substring(1)), f);
                        } else {
                            console.log('FragmentPagerAdapter', `Bad fragment at key ${key}`);
                        }
                    }
                }
            }
        }

        getItemId(position: number) {
            return position;
        }

        isViewFromObject(view: any /*android.view.View*/, object: any /*java.lang.Object*/): boolean {
            return (<android.support.v4.app.Fragment>object).getView() === view;
        }

        getItemPosition(object: any) {
            const count = this.mFragments.size();
            const fragment = /*<android.support.v4.app.Fragment>*/object;
            let position = POSITION_NONE;
            for (let i = 0; i < count; i++) {
                const item = this.getItem(i);
                if (item && item.equals(fragment)) {
                    position = i;
                    break;
                }
            }
            return position;
        }
    }
    PagerStateAdapter = PagerStateAdapterImpl as any;
}

let TNSViewPager: TNSViewPager;
interface TNSViewPager extends android.support.v4.view.ViewPager {
    new (context: android.content.Context): TNSViewPager;
    owner: WeakRef<Pager>;
}

function initTNSViewPager() {
class TNSViewPagerImpl extends android.support.v4.view.ViewPager {
    disableSwipe: boolean;
    owner: WeakRef<Pager>;
    lastEventX;
    currentView;
    // _verticalScrolling: boolean;

    constructor(context) {
        super(context);
        // this._verticalScrolling = false;
        // this.transformer = new VerticalPageTransformer();
        // this.setPageTransformer(true, new VerticalPageTransformer());
        // The easiest way to get rid of the overscroll drawing that happens on the left and right
        // this.setOverScrollMode(android.support.v4.view.ViewPager.OVER_SCROLL_NEVER);
        return global.__native(this);
    }

    // canScrollHorizontally( direction) {
    //     if (this._verticalScrolling) {
    //         return false;
    //     }
    //     return super.canScrollHorizontally(direction);
    // }

    // canScrollVertically( direction) {
    //     if (this._verticalScrolling) {
    //         return super.canScrollHorizontally(direction);
    //     }
    //     return false;
    // }

    // set verticalScrolling(value: boolean) {
    //     if (value !== this._verticalScrolling) {
    //         this._verticalScrolling = value;
    //         if (value) {
    //             this.setPageTransformer(true, new VerticalPageTransformer());
    //             this.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
    //         } else {
    //             this.setPageTransformer(false, null);
    //             this.setOverScrollMode(android.view.View.OVER_SCROLL_ALWAYS);
    //         }
    //     }
    // }

    // flipXY(ev) {
    //     const width = this.getWidth();
    //     const height = this.getHeight();

    //     const newX = (ev.getY() / height) * width;
    //     const newY = (ev.getX() / width) * height;

    //     ev.setLocation(newX, newY);

    //     return ev;
    // }

    onInterceptTouchEvent(ev) {
        const owner = this.owner.get();
        if (!!owner.disableSwipe) return false;
        if (this.isSwipeAllowed(owner, ev)) {
            // if (this._verticalScrolling) {
            //     const toHandle = super.onInterceptTouchEvent(this.flipXY(ev));
            //     this.flipXY(ev);
            //     return toHandle;
            // }
            return super.onInterceptTouchEvent(ev);
        }
        return false;
    }

    onTouchEvent(ev) {
        const owner = this.owner.get();
        if (!!owner.disableSwipe) return false;

        if (this.isSwipeAllowed(owner, ev)) {
            // if (this._verticalScrolling) {
            //     const toHandle = super.onTouchEvent(this.flipXY(ev));
            //     this.flipXY(ev);
            //     return toHandle;
            // }
            return super.onTouchEvent(ev);
        }
        return false;
        // return super.onTouchEvent(this.swapXY(ev));

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
TNSViewPager = TNSViewPagerImpl as any;
}

let TNSVerticalViewPager: TNSVerticalViewPager;

interface TNSVerticalViewPager extends android.support.v4.view.ViewPager {
    new (context: android.content.Context): TNSVerticalViewPager;
    owner: WeakRef<Pager>;
}
function initTNSVerticalViewPager() {
class TNSVerticalViewPagerImpl extends com.lambergar.verticalviewpager.VerticalViewPager {
    disableSwipe: boolean;
    owner: WeakRef<Pager>;
    lastEventX;
    currentView;
    // _verticalScrolling: boolean;

    constructor(context) {
        super(context);
        // this._verticalScrolling = false;
        // this.transformer = new VerticalPageTransformer();
        // this.setPageTransformer(true, new VerticalPageTransformer());
        // The easiest way to get rid of the overscroll drawing that happens on the left and right
        // this.setOverScrollMode(android.support.v4.view.ViewPager.OVER_SCROLL_NEVER);
        return global.__native(this);
    }

    onInterceptTouchEvent(ev) {
        const owner = this.owner.get();
        if (!!owner.disableSwipe) return false;
        if (this.isSwipeAllowed(owner, ev)) {
            return super.onInterceptTouchEvent(ev);
        }
        return false;
    }

    onTouchEvent(ev) {
        const owner = this.owner.get();
        if (!!owner.disableSwipe) return false;

        if (this.isSwipeAllowed(owner, ev)) {
            return super.onTouchEvent(ev);
        }
        return false;
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
TNSVerticalViewPager = TNSVerticalViewPagerImpl as any;
}
// @JavaProxy('com.triniwiz.tns.pager.VerticalPageTransformer')
// export class VerticalPageTransformer extends android.support.v4.view.ViewPager.PageTransformer {

//     owner: WeakRef<Pager>;

//     constructor() {
//         super();
//         return global.__native(this);
//     }

//     public transformPage(view, position) {
//         if (position < -1) {
//             // [-Infinity,-1)
//             // This page is way off-screen to the left.
//             view.setAlpha(0);
//         } else if (position <= 1) {
//             // [-1,1]
//             view.setAlpha(1);

//             // Counteract the default slide transition
//             view.setTranslationX(view.getWidth() * -position);

//             // set Y position to swipe in from top
//             const yPosition = position * view.getHeight();
//             view.setTranslationY(yPosition);
//         } else {
//             // (1,+Infinity]
//             // This page is way off-screen to the right.
//             view.setAlpha(0);
//         }
//     }
// }


let ZoomOutPageTransformer: ZoomOutPageTransformer;
interface ZoomOutPageTransformer extends android.support.v4.view.ViewPager.PageTransformer {
    new (): ZoomOutPageTransformer;
    owner: WeakRef<Pager>;
}

function initZoomOutPageTransformer() {
class ZoomOutPageTransformerImpl extends android.support.v4.view.ViewPager.PageTransformer {
    owner: WeakRef<Pager>;

    constructor() {
        super();
        return global.__native(this);
    }

    public transformPage(view, position) {
        const MIN_SCALE = 0.75;
        const owner = this.owner ? this.owner.get() : null;
        if (!owner) return;
        if (position <= -.1 || position >= 1) {
            const scale = Math.max(MIN_SCALE, 1 - Math.abs(position));
            view.setScaleX(scale);
            view.setScaleY(scale);
        } else {
            view.setScaleX(1);
            view.setScaleY(1);
        }
    }

}
ZoomOutPageTransformer = ZoomOutPageTransformerImpl as any;
}
