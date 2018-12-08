module.exports = function install(Vue) {
	Vue.registerElement('NativePager', () => require('../').Pager);
	Vue.registerElement('PagerItem', () => require('../').PagerItem);
	Vue.component('Pager', require('./pager')(Vue))
}
