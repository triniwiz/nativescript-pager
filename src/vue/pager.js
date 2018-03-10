export default function pager(Vue) {
  return {
    // name: 'pager',
    props: {
      items: {
        type: Array,
        required: true
      },
      '+alias': {
        type: String,
        default: 'item'
      },
      '+index': {
        type: String
      }
    },
    template: `
    <native-pager
      ref="pagerView"
      :items="items"
      v-bind="$attrs"
      v-on="listeners"
      @itemTap="onItemTap"
      @itemLoading="onItemLoading">
      <slot />
    </native-pager>
  `,
    watch: {
      items: {
        handler(newVal) {
          this.$refs.pagerView.setAttribute('items', newVal);
          this.$refs.pagerView.nativeView.refresh();
        },
        deep: true
      }
    },
    created() {
      // we need to remove the itemTap handler from a clone of the $listeners
      // object because we are emitting the event ourselves with added data.
      const listeners = Object.assign({}, this.$listeners);
      delete listeners.itemTap;
      this.listeners = listeners;
    },
    mounted() {
      this.getItemContext = (item, index) =>
        getItemContext(item, index, this.$props['+alias'], this.$props['+index']);
      this.$refs.pagerView.setAttribute('items', this.items);
      this.$refs.pagerView.setAttribute(
        '_itemTemplatesInternal',
        this.$templates.getKeyedTemplates()
      );
      this.$refs.pagerView.setAttribute(
        '_itemTemplateSelector',
        (item, index) => {
          return this.$templates.selectorFn(this.getItemContext(item, index));
        }
      );
    },
    methods: {
      onItemTap(args) {
        this.$emit(
          'itemTap',
          Object.assign({item: this.items[args.index]}, args)
        );
      },
      onItemLoading(args) {
        const index = args.index;
        const items = args.object.items;
        const currentItem =
          typeof items.getItem === 'function'
            ? items.getItem(index)
            : items[index];
        const name = args.object._itemTemplateSelector(currentItem, index, items);
        const context = this.getItemContext(currentItem, index);
        const oldVnode = args.view && args.view[Vue.VUE_VIEW];
        args.view = this.$templates.patchTemplate(name, context, oldVnode);
      }
    }
  };

  function getItemContext(item, index, alias, index_alias) {
    return {
      [alias]: item,
      [index_alias || '$index']: index,
      $even: index % 2 === 0,
      $odd: index % 2 !== 0
    };
  }
}
