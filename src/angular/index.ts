import {
  Component,
  NgModule,
  Directive,
  ElementRef,
  TemplateRef,
  IterableDiffers,
  ChangeDetectorRef,
  ViewContainerRef,
  Input,
  Inject,
  forwardRef,
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
  ɵisListLikeIterable as isListLikeIterable,
  AfterContentInit,
  DoCheck,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  EmbeddedViewRef,
  ContentChild,
  Host,
  IterableDiffer,
  AfterViewInit
} from '@angular/core';
import {
  registerElement,
  getSingleViewRecursive
} from 'nativescript-angular/element-registry';
import { View, KeyedTemplate } from 'tns-core-modules/ui/core/view';
import { isBlank } from 'nativescript-angular/lang-facade';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { profile } from 'tns-core-modules/profiling';
import { LayoutBase } from 'tns-core-modules/ui/layouts/layout-base';
import { PagerError, PagerLog, ITEMLOADING } from '../pager.common';
import { Pager } from '../';
const NG_VIEW = '_ngViewRef';

registerElement('Pager', () => require('../').Pager);

export interface ComponentView {
  rootNodes: Array<any>;
  destroy(): void;
}

export type RootLocator = (nodes: Array<any>, nestLevel: number) => View;

export function getItemViewRoot(
  viewRef: ComponentView,
  rootLocator: RootLocator = getSingleViewRecursive
): View {
  return rootLocator(viewRef.rootNodes, 0);
}

export class PagerItemContext {
  constructor(
    public $implicit?: any,
    public item?: any,
    public index?: number,
    public even?: boolean,
    public odd?: boolean
  ) {}
}

export interface SetupItemViewArgs {
  view: EmbeddedViewRef<any>;
  data: any;
  index: number;
  context: PagerItemContext;
}

@Component({
  selector: 'Pager',
  template: `
        <DetachedContainer>
            <Placeholder #loader></Placeholder>
        </DetachedContainer>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagerComponent
  implements DoCheck, OnDestroy, AfterViewInit, AfterContentInit {
  private viewInitialized: any;
  private _selectedIndex: any;
  private _items: any;
  private _differ: IterableDiffer<KeyedTemplate>;
  private pager: Pager;
  itemTemplate: TemplateRef<PagerItemContext>;
  private _templateMap: Map<string, KeyedTemplate>;
  @ViewChild('loader', { read: ViewContainerRef })
  loader: ViewContainerRef;

  @Output() public setupItemView = new EventEmitter<SetupItemViewArgs>();

  @ContentChild(TemplateRef) itemTemplateQuery: TemplateRef<PagerItemContext>;

  constructor(el: ElementRef, private _iterableDiffers: IterableDiffers) {
    this.pager = el.nativeElement;
    this.pager.on(ITEMLOADING, this.onItemLoading, this);
  }

  public ngAfterContentInit() {
    this.setItemTemplates();
  }

  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(value) {
    this._selectedIndex = value;
    if (this.viewInitialized) {
      this.pager.selectedIndex = this._selectedIndex;
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    if (!isBlank(this._selectedIndex)) {
      this.pager.selectedIndex = this._selectedIndex;
    }
  }
  get nativeElement() {
    return this.pager;
  }

  @Input()
  get items() {
    return this._items;
  }

  set items(value: any) {
    this._items = value;
    let needDiffer = true;
    if (value instanceof ObservableArray) {
      needDiffer = false;
    }
    if (needDiffer && !this._differ && isListLikeIterable(value)) {
      this._differ = this._iterableDiffers
        .find(this._items)
        .create((_index, item) => {
          return item;
        });
    }
    this.pager.items = this._items;
  }

  private setItemTemplates() {
    this.itemTemplate = this.itemTemplateQuery;

    if (this._templateMap) {
      const templates: KeyedTemplate[] = [];
      this._templateMap.forEach(value => {
        templates.push(value);
      });
      this.pager.itemTemplates = templates;
    }
  }

  public registerTemplate(
    key: string,
    template: TemplateRef<PagerItemContext>
  ) {
    if (!this._templateMap) {
      this._templateMap = new Map<string, KeyedTemplate>();
    }

    const keyedTemplate = {
      key,
      createView: () => {
        const viewRef = this.loader.createEmbeddedView(
          template,
          new PagerItemContext(),
          0
        );
        const resultView = getItemViewRoot(viewRef);
        resultView[NG_VIEW] = viewRef;

        return resultView;
      }
    };

    this._templateMap.set(key, keyedTemplate);
  }

  ngOnDestroy() {
    this.pager.off(ITEMLOADING, this.onItemLoading, this);
  }

  @profile
  public onItemLoading(args: any) {
    if (!args.view && !this.itemTemplate) {
      return;
    }

    const index = args.index;
    const items = (<any>args.object).items;
    const currentItem =
      typeof items.getItem === 'function' ? items.getItem(index) : items[index];
    let viewRef: EmbeddedViewRef<PagerItemContext>;
    if (args.view) {
      viewRef = args.view[NG_VIEW];
      // Getting angular view from original element (in cases when ProxyViewContainer
      // is used NativeScript internally wraps it in a StackLayout)
      if (
        !viewRef &&
        args.view instanceof LayoutBase &&
        args.view.getChildrenCount() > 0
      ) {
        viewRef = args.view.getChildAt(0)[NG_VIEW];
      }

      if (!viewRef) {
        PagerError(
          'ViewReference not found for item ' +
            index +
            '. View recycling is not working'
        );
      }
    }

    if (!viewRef) {
      PagerLog('onItemLoading: ' + index + ' - Creating view from template');
      viewRef = this.loader.createEmbeddedView(
        this.itemTemplate,
        new PagerItemContext(),
        0
      );
      args.view = getItemViewRoot(viewRef);
      args.view[NG_VIEW] = viewRef;
    }

    this.setupViewRef(viewRef, currentItem, index);

    this.detectChangesOnChild(viewRef, index);
  }

  public setupViewRef(
    viewRef: EmbeddedViewRef<PagerItemContext>,
    data: any,
    index: number
  ): void {
    const context = viewRef.context;
    context.$implicit = data;
    context.item = data;
    context.index = index;
    context.even = index % 2 === 0;
    context.odd = !context.even;

    (this.setupItemView as any).next({
      view: viewRef,
      data: data,
      index: index,
      context: context
    });
  }

  @profile
  private detectChangesOnChild(
    viewRef: EmbeddedViewRef<PagerItemContext>,
    index: number
  ) {
    PagerLog('Manually detect changes in child: ' + index);
    viewRef.markForCheck();
    viewRef.detectChanges();
  }

  ngDoCheck() {
    if (this._differ) {
      PagerLog('ngDoCheck() - execute differ');
      const changes = this._differ.diff(this._items);
      if (changes) {
        PagerLog('ngDoCheck() - refresh');
        this.pager.refresh();
      }
    }
  }
}

@Directive({ selector: '[pagerTemplateKey]' })
export class TemplateKeyDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    @Host() private pager: PagerComponent
  ) {}

  @Input()
  set pagerTemplateKey(value: any) {
    if (this.pager && this.templateRef) {
      this.pager.registerTemplate(value, this.templateRef);
    }
  }
}

@NgModule({
  declarations: [PagerComponent, TemplateKeyDirective],
  exports: [PagerComponent, TemplateKeyDirective],
  schemas: [NO_ERRORS_SCHEMA]
})
export class PagerModule {}
