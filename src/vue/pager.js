module.exports = function pager(Vue) {
	return {
		model: {
			prop: 'selectedIndex',
			event: 'selectedIndexChange'
		},
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
				type: String,
				default: '$index'
			},
			selectedIndex: {
				type: Number,
				default: 0
			}
		},
		template: `
    <NativePager
      ref="pagerView"
      :items="items"
      v-bind="$attrs"
      v-on="listeners"
      :selectedIndex="selectedIndex"
      @itemLoading="onItemLoading">
      <slot />
    </NativePager>
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
		computed: {
			listeners() {
				return Object.assign({}, this.$listeners, {
					selectedIndexChange: this.onSelectedIndexChange
				})
			}
		},
		mounted() {
			if (!this.items) return;
			this.getItemContext = (item, index) =>
				getItemContext(item, index, this.$props[ '+alias' ], this.$props[ '+index' ]);
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
			onItemLoading(args) {
				if (!this.items) return;
				const index = args.index;
				const items = args.object.items;
				const currentItem =
					typeof items.getItem === 'function'
						? items.getItem(index)
						: items[ index ];
				const name = args.object._itemTemplateSelector(currentItem, index, items);
				const context = this.getItemContext(currentItem, index);
				const oldVnode = args.view && args.view[ Vue.VUE_VIEW ];
				args.view = this.$templates.patchTemplate(name, context, oldVnode);
			},
			onSelectedIndexChange({ value }) {
				this.$emit('selectedIndexChange', value)
			}
		}
	};

	function getItemContext(item, index, alias, index_alias) {
		return {
			[ alias ]: item,
			[ index_alias ]: index,
			$even: index % 2 === 0,
			$odd: index % 2 !== 0
		};
	}
}
