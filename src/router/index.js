import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Directories from '../views/Directories.vue'
import Test from '../views/Test.vue'
import Settings from '../views/Settings.vue'

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
