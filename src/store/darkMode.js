// store/darkMode.js
export default {
  state: {
    darkMode: false
  },
  mutations: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    }
  },
  getters: {
    isDarkMode(state) {
      return state.darkMode
    }
  }
}
