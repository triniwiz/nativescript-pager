import {
  booleanConverter,
  CoercibleProperty,
  KeyedTemplate,
  Property,
  Template,
  View,
  makeParser,
  makeValidator,
  ContainerView
} from 'tns-core-modules/ui/core/view';
import { isIOS } from 'tns-core-modules/platform';
import * as types from 'tns-core-modules/utils/types';
import { parse, parseMultipleTemplates } from 'tns-core-modules/ui/builder';
import { Label } from 'tns-core-modules/ui/label';
import { messageType, write } from 'tns-core-modules/trace';
import { Observable } from 'tns-core-modules/data/observable';
import {
  addWeakEventListener,
  removeWeakEventListener
} from 'tns-core-modules/ui/core/weak-event-listener';
import { ItemsSource } from 'tns-core-modules/ui/list-view/list-view';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

export type Orientation = 'horizontal' | 'vertical';

export const ITEMLOADING = 'itemLoading';
export const LOADMOREITEMS = 'loadMoreItems';
export namespace knownTemplates {
  export const itemTemplate = 'itemTemplate';
}

export namespace knownMultiTemplates {
  export const itemTemplates = 'itemTemplates';
}

export namespace knownCollections {
  export const items = 'items';
}

export const pagerTraceCategory = 'ns-pager';

export function PagerLog(message: string): void {
  write(message, pagerTraceCategory);
}

export function PagerError(message: string): void {
  write(message, pagerTraceCategory, messageType.error);
}
import {   } from 'tns-core-modules/ui/core/view';
export abstract class PagerBase extends ContainerView {
  public disableCache: boolean;
  public items: any[] | ItemsSource;
  public selectedIndex: number;
  public showNativePageIndicator: boolean;
  public itemTemplate: string | Template;
  public itemTemplates: string | Array<KeyedTemplate>;
  public canGoRight = true;
  public canGoLeft = true;
  private _pageSpacing: number = 0;
  public static selectedIndexChangedEvent = 'selectedIndexChanged';
  public static selectedIndexChangeEvent = 'selectedIndexChange';
  public orientation: Orientation;
  // TODO: get rid of such hacks.
  public static knownFunctions = ['itemTemplateSelector']; // See component-builder.ts isKnownFunction
  abstract refresh(hardReset): void;

  private _itemTemplateSelector: (
    item: any,
    index: number,
    items: any
  ) => string;
  private _itemTemplateSelectorBindable = new Label();
  public _defaultTemplate: KeyedTemplate = {
    key: 'default',
    createView: () => {
      if (this.itemTemplate) {
        return parse(this.itemTemplate, this);
      }
      return undefined;
    }
  };

  public _itemTemplatesInternal = new Array<KeyedTemplate>(
    this._defaultTemplate
  );

  get itemTemplateSelector():
    | string
    | ((item: any, index: number, items: any) => string) {
    return this._itemTemplateSelector;
  }

  set itemTemplateSelector(
    value: string | ((item: any, index: number, items: any) => string)
  ) {
    if (typeof value === 'string') {
      this._itemTemplateSelectorBindable.bind({
        sourceProperty: null,
        targetProperty: 'templateKey',
        expression: value
      });
      this._itemTemplateSelector = (item: any, index: number, items: any) => {
        item['$index'] = index;
        this._itemTemplateSelectorBindable.bindingContext = item;
        return this._itemTemplateSelectorBindable.get('templateKey');
      };
    } else if (typeof value === 'function') {
      this._itemTemplateSelector = value;
    }
  }

  public _getItemTemplate(index: number): KeyedTemplate {
    let templateKey = 'default';
    if (this.itemTemplateSelector) {
      let dataItem = this._getDataItem(index);
      templateKey = this._itemTemplateSelector(dataItem, index, this.items);
    }

    for (
      let i = 0, length = this._itemTemplatesInternal.length;
      i < length;
      i++
    ) {
      if (this._itemTemplatesInternal[i].key === templateKey) {
        return this._itemTemplatesInternal[i];
      }
    }

    // This is the default template
    return this._itemTemplatesInternal[0];
  }

  public _prepareItem(item: View, index: number) {
    if (item) {
      item.bindingContext = this._getDataItem(index);
    }
  }

  private _getDataItem(index: number): any {
    let thisItems = this.items;
    return thisItems && (<ItemsSource>thisItems).getItem
      ? (<ItemsSource>thisItems).getItem(index)
      : thisItems[index];
  }

  public _getDefaultItemContent(index: number): View {
    let lbl = new Label();
    lbl.bind({
      targetProperty: 'text',
      sourceProperty: '$value'
    });
    return lbl;
  }

  abstract get disableSwipe(): boolean;
  abstract set disableSwipe(value: boolean);

  abstract get disableAnimation(): boolean;
  abstract set disableAnimation(value: boolean);

  get pageSpacing() {
    return this._pageSpacing;
  }

  set pageSpacing(value: number) {
    this._pageSpacing = value;
  }

  public abstract updateNativeItems(
    oldItems: Array<View>,
    newItems: Array<View>
  ): void;

  public abstract updateNativeIndex(oldIndex: number, newIndex: number): void;

  public abstract itemTemplateUpdated(oldData, newData): void;
}

function onItemsChanged(pager: PagerBase, oldValue, newValue) {
  if (oldValue instanceof Observable) {
    removeWeakEventListener(
      oldValue,
      ObservableArray.changeEvent,
      pager.refresh,
      pager
    );
  }

  if (newValue instanceof Observable) {
    addWeakEventListener(
      newValue,
      ObservableArray.changeEvent,
      pager.refresh,
      pager
    );
  }
  pager.refresh(false);
}

function onItemTemplateChanged(pager: PagerBase, oldValue, newValue) {
  pager.itemTemplateUpdated(oldValue, newValue);
}

function onSelectedIndexChanged(pager: PagerBase, oldValue, newValue) {
  if (pager && pager.items && types.isNumber(newValue)) {
    pager.updateNativeIndex(oldValue, newValue);
  }
}

export const selectedIndexProperty = new CoercibleProperty<PagerBase, number>({
  name: 'selectedIndex',
  defaultValue: -1,
  valueChanged: onSelectedIndexChanged,
  affectsLayout: isIOS,
  coerceValue: (target, value) => {
    let items = target.items;
    if (items) {
      let max = items.length - 1;
      if (value < 0) {
        value = 0;
      }
      if (value > max) {
        value = max;
      }
    } else {
      value = -1;
    }

    return value;
  },
  valueConverter: v => parseInt(v, 10)
});
selectedIndexProperty.register(PagerBase);

export const itemsProperty = new Property<PagerBase, any>({
  name: 'items',
  affectsLayout: true,
  valueChanged: onItemsChanged
});
itemsProperty.register(PagerBase);

export const showNativePageIndicatorProperty = new Property<PagerBase, boolean>(
  {
    name: 'showNativePageIndicator',
    defaultValue: false,
    valueConverter: booleanConverter
  }
);
showNativePageIndicatorProperty.register(PagerBase);

export const itemTemplateProperty = new Property<PagerBase, string | Template>({
  name: 'itemTemplate',
  affectsLayout: true,
  valueChanged: target => {
    target.refresh(true);
  }
});
itemTemplateProperty.register(PagerBase);

export const itemTemplatesProperty = new Property<
  PagerBase,
  string | Array<KeyedTemplate>
>({
  name: 'itemTemplates',
  affectsLayout: true,
  valueConverter: value => {
    if (typeof value === 'string') {
      return parseMultipleTemplates(value);
    }
    return value;
  }
});
itemTemplatesProperty.register(PagerBase);

export const canGoRightProperty = new Property<PagerBase, boolean>({
  name: 'canGoRight',
  defaultValue: false,
  valueConverter: booleanConverter
});
canGoRightProperty.register(PagerBase);

export const canGoLeftProperty = new Property<PagerBase, boolean>({
  name: 'canGoLeft',
  defaultValue: false,
  valueConverter: booleanConverter
});
canGoLeftProperty.register(PagerBase);

const converter = makeParser<Orientation>(
  makeValidator('horizontal', 'vertical')
);

export const orientationProperty = new Property<PagerBase, Orientation>({
  name: 'orientation',
  defaultValue: 'horizontal',
  affectsLayout: true,
  valueChanged: (
    target: PagerBase,
    oldValue: Orientation,
    newValue: Orientation
  ) => {
    target.refresh(false);
  },
  valueConverter: converter
});

orientationProperty.register(PagerBase);
