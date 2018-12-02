import { KeyedTemplate, Property, View } from 'tns-core-modules/ui/core/view';
import * as common from './pager.common';
import {
    ITEMLOADING,
    itemsProperty,
    itemTemplatesProperty,
    LOADMOREITEMS,
    PagerBase,
    peakingProperty,
    selectedIndexProperty,
    spacingProperty
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

export { Transformer } from './pager.common';

export class Pager extends PagerBase {
    _androidViewId: number;
    disableSwipe: boolean;
    private _disableAnimation: boolean;
    public pagesCount: number;
    widthMeasureSpec: number;
    heightMeasureSpec: number;

    public itemTemplateUpdated(oldData: any, newData: any): void {
    }

    _android: TNSViewPager;
    _pagerAdapter: PagerStateAdapter | PagerAdapter;
    private _views: Array<any>;
    private _pageListener: any;
    _viewMap: Map<string, View>;
    public _realizedItems = new Map<android.view.View, View>();
    public _realizedTemplates = new Map<string, Map<android.view.View, View>>();

    constructor() {
        super();
        pagers.set(this._domId, new WeakRef<Pager>(this));
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
        this.on(View.layoutChangedEvent, (args: any) => {
            const spacing = this.convertToSize(args.object.spacing);
            const peaking = this.convertToSize(args.object.peaking);
            if (spacing > 0 && peaking > 0) {
                this._android.setClipToPadding(false);
                this._android.setPadding(peaking, 0, peaking, 0);
                this._android.setPageMargin(spacing / 2);
            }
        });
        const that = new WeakRef(this);
        this._viewMap = new Map();
        this._android = new TNSViewPager(this._context);

        this._android.owner = that;
        this._pageListener = new android.support.v4.view.ViewPager.OnPageChangeListener(
            {
                onPageSelected: function (position: number) {
                    const owner = that.get();
                    if (owner) {
                        owner.selectedIndex = position;
                    }
                },
                onPageScrolled: function (
                    position,
                    positionOffset,
                    positionOffsetPixels
                ) {
                },
                onPageScrollStateChanged: function (state) {
                }
            }
        );

        this._pagerAdapter = new PagerStateAdapter();
        this._pagerAdapter.mFragmentManager = (this as any)._getFragmentManager();
        this._pagerAdapter.owner = new WeakRef(this);

        if (this.pagesCount > 0) {
            this._android.setOffscreenPageLimit(this.pagesCount);
        } else {
            this._android.setOffscreenPageLimit(3);
        }
        return this._android;
    }

    [spacingProperty.setNative](value: any) {
        const size = this.convertToSize(value);
        if (size > 0) {
            this._android.setClipToPadding(false);
            this._android.setPageMargin(size / 2);
        }
    }

    [peakingProperty.setNative](value: any) {
        const size = this.convertToSize(value);
        if (size > 0) {
            this._android.setClipToPadding(false);
            this._android.setPadding(size, 0, size, 0);
        }
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

    public disposeNativeView() {
        this._viewMap.clear();
        this.off(View.layoutChangedEvent);
        super.disposeNativeView();
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
            this._android.getAdapter().notifyDataSetChanged();
        }
    }

    updatePagesCount(value: number) {
        if (this._android) {
            this._pagerAdapter.notifyDataSetChanged();
            this._android.setOffscreenPageLimit(value);
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
}

export const pagesCountProperty = new Property<Pager, number>({
    name: 'pagesCount',
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
    position: number;
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
        fragment.setArguments(args);
        return fragment;
    }

    onCreateView(inflater: android.view.LayoutInflater, collection: android.view.ViewGroup, bundle: android.os.Bundle): android.view.View {
        if (!this.owner) {
            return null;
        }
        const owner = this.owner.get();
        if (this.position === owner.items.length - 1) {
            owner.notify({eventName: LOADMOREITEMS, object: owner});
        }
        const template = owner._getItemTemplate(this.position);
        if (owner._viewMap.has(`${this.position}-${template.key}`)) {
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
            owner._android.addView(view.nativeView);
        }
        return view.nativeView;
    }

    public onDestroyView() {
        super.onDestroyView();
    }
}

export class PagerStateAdapter extends android.support.v4.view.PagerAdapter {
    owner: WeakRef<Pager>;
    mFragmentManager: android.support.v4.app.FragmentManager;
    mCurTransaction: android.support.v4.app.FragmentTransaction;
    mCurrentPrimaryItem: any;
    mFragments: android.support.v4.util.LongSparseArray<number>;
    mSavedStates: android.support.v4.util.LongSparseArray<any>;
    private updating: boolean;

    constructor() {
        super();
        this.mFragments = new android.support.v4.util.LongSparseArray();
        this.mSavedStates = new android.support.v4.util.LongSparseArray();
        return global.__native(this);
    }

    startUpdate(container: android.view.ViewGroup): void {
        if (container.getId() === android.view.View.NO_ID) {
            throw new Error('ViewPager with adapter ' + this
                + ' requires a view id');
        }
    }

    registerDataSetObserver(param0: android.database.DataSetObserver): void {
        super.registerDataSetObserver(param0);
    }

    unregisterDataSetObserver(param0: android.database.DataSetObserver): void {
        super.unregisterDataSetObserver(param0);
    }

    instantiateItem(container: android.view.ViewGroup, position: number): any {
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
            if (position === owner.items.length - 1) {
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

    destroyItem(container: android.view.ViewGroup, position: number, object: any): void {
        let fragment = <android.support.v4.app.Fragment>object;
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

        this.mCurTransaction.remove(fragment);
    }

    setPrimaryItem(container: android.view.ViewGroup, position: number, object: any): void {
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
            const owner = this.owner ? this.owner.get() : null;
            if (cachedView && cachedView.nativeView && !cachedView.nativeView.getParent() && container) {
                container.addView(cachedView.nativeView);
            }
        }
    }

    private getViewByPosition(position: number): View {
        let cachedView = null;
        const owner = this.owner.get();
        const template = owner._getItemTemplate(position);
        if (owner._viewMap.has(`${position}-${template.key}`)) {
            cachedView = <View>owner._viewMap.get(`${position}-${template.key}`);
        }
        return cachedView;
    }

    finishUpdate(container: android.view.ViewGroup): void {
        if (this.mCurTransaction != null) {
            this.mCurTransaction.commitNowAllowingStateLoss();
            this.mCurTransaction = null;
        }
    }

    getCount(): number {
        const owner = this.owner ? this.owner.get() : null;
        return owner.items ? owner.items.length : 0;
    }

    getItem(position: number): android.support.v4.app.Fragment {
        if (!this.owner) {
            return null;
        }
        const owner = this.owner.get();
        return PagerFragment.newInstance(owner._domId, position);
    }

    saveState(): android.os.Parcelable {
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

    restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader): void {
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

    isViewFromObject(view: android.view.View, object: java.lang.Object): boolean {
        return (<android.support.v4.app.Fragment>object).getView() === view;
    }

    getItemPosition(object) {
        const count = this.mFragments.size();
        const fragment = <android.support.v4.app.Fragment>object;
        let position = POSITION_NONE;
        for (let i = 0; i < count; i++) {
            const item = this.getItem(i);
            if (item.equals(fragment)) {
                position = i;
                break;
            }
        }
        return position;
    }
}

export class PagerAdapter extends android.support.v4.view.PagerAdapter {
    owner: Pager;

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
            this.owner.notify({eventName: LOADMOREITEMS, object: this.owner});
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
        /*const template = this.owner._getItemTemplate(position);
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
        */
    }

    getCount() {
        return this.owner.items ? this.owner.items.length : 0;
    }

    isViewFromObject(view: android.view.View, object) {
        return view === object;
    }
}

@JavaProxy('com.triniwiz.tns.pager.TNSViewPager')
export class TNSViewPager extends android.support.v4.view.ViewPager {
    disableSwipe: boolean;
    owner: WeakRef<Pager>;
    lastEventX;
    transformer: VerticalPageTransformer;
    currentView;

    constructor(context) {
        super(context);
        // this.transformer = new VerticalPageTransformer();
        // this.setPageTransformer(true, new VerticalPageTransformer());
        // The easiest way to get rid of the overscroll drawing that happens on the left and right
        // this.setOverScrollMode(android.support.v4.view.ViewPager.OVER_SCROLL_NEVER);

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
        return this.isSwipeAllowed(owner, ev) ? super.onInterceptTouchEvent(ev) : false;
        /*
        const intercepted = super.onInterceptTouchEvent(this.swapXY(ev));
        this.swapXY(ev);
        return intercepted;
        */
        //    return this.isSwipeAllowed(owner, ev) ? super.onInterceptTouchEvent(ev) : false;
    }

    onTouchEvent(ev) {
        const owner = this.owner.get();
        if (owner.disableSwipe) return false;

        return this.isSwipeAllowed(owner, ev) ? super.onTouchEvent(ev) : false;
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
