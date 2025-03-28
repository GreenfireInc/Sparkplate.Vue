export default {
  data: () => ({
    loader: null
  }),
  methods: {
    showLoader(ref, options) {
      if (!this.loader) {
        this.loader = this.$loader(ref, options)
        return this.loader
      }
    },
    hideLoader() {
      if (this.loader) {
        this.loader.hide()
        this.loader = null
      }
    }
  }
}
