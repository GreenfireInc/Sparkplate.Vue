import Vue from 'vue'

export const Loader = (ref, options) => {
  return Vue.prototype.$loading.show({
    container: ref,
    loader: options ? options.loaderType : 'spinner',
    isFullScreen:
      options && typeof options.isFullScreen !== 'undefined'
        ? options.isFullScreen
        : false,
    color:
      options && typeof options.color !== 'undefined' ? options.color : '#000',
    width: 30,
    height: 30,
    zIndex:
      options && typeof options.zIndex !== 'undefined' ? options.zIndex : 9999,
    opacity:
      options && typeof options.opacity !== 'undefined' ? options.opacity : 0.7,
    backgroundColor:
      options && typeof options.backgroundColor !== 'undefined'
        ? options.backgroundColor
        : '#fff'
  })
}
