import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
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

router.beforeEach((to, from, next) => {
  let val = localStorage.getExpire('userInfo')
  if (val) {
    next()
  } else if (!val && to.path !== '/login') {
    next('/login')
  } else if (!val && to.path == '/login') {
    next()
  }
})

export default router
