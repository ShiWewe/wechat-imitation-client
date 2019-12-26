// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui';
import router from './router'
import VueSocketio from 'vue-socket.io';
import './assets/iconfont/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css';
import './libs/storage'

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(new VueSocketio({
  debug: true,
  connection: 'http://192.168.1.140:3000'
}));

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
