import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Directories from '../views/Directories.vue'
import Test from '../views/Test.vue'
import Settings from '../views/settings.vue'
// import PageOne from '../views/PageOne.vue'
// import PageTwo from '../views/PageTwo.vue'
import MarketPage from '../views/MarketPage.vue'
import MetaversePage from '../views/MetaversePage.vue'
import GamingPage from '../views/GamingPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/directories',
    name: 'Directories',
    component: Directories
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  },
  // {
  //   path: '/pageone',
  //   name: 'PageOne',
  //   component: PageOne
  // },
  // {
  //   path: '/pagetwo',
  //   name: 'PageTwo',
  //   component: PageTwo
  // },
  {
    path: '/marketpage',
    name: 'MarketPage',
    component: MarketPage
  },
  {
    path: '/metaversepage',
    name: 'MetaversePage',
    component: MetaversePage
  },
  {
    path: '/gaminpage',
    name: 'GamingPage',
    component: GamingPage
  },
  {
    path: '/settings/:activeTab',
    name: 'Settings',
    component: Settings
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: import.meta.env.BASE_URL,
  routes
})

export default router
