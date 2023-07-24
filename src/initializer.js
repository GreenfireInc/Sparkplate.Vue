import Vue from 'vue'
import VueGtag from 'vue-gtag'

async function init() {
  const { default: App } = await import('./App.vue')
  const { default: store } = await import('./store')
  const { default: router } = await import('./router')
  const { default: mixin } = await import('./mixins')

  Vue.use(
    VueGtag,
    {
      config: { id: 'G-G0L036DHR0' }
    },
    router
  )

  new Vue({
    router,
    store: store,
    mixins: [mixin],
    render: (h) => h(App)
  }).$mount('#app')
}

export default init
