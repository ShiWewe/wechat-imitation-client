import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'code',
      redirect: '/wechat',
      component: () => import('@/components/code.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/login.vue')
    },
    {
      path: '/wechat',
      name: 'wechat',
      component: () => import('@/components/wechat.vue')
    }
  ]
})
