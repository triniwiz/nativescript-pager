module.exports = function install(Vue) {
  Vue.registerElement('NativePager', () => require('../').Pager);
  Vue.component('Pager', require('./pager')(Vue))
}
