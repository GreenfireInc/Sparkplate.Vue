<!--
Contributors: Arsalan Ali Daim

Description: This component handles the color selection for the icons on the left side nav bar and the background color for the top nav bar.
-->

<template>
  <div class="w-100">
    <h1 class="view-name mb-3">Select Header Color</h1>
    <div class="d-flex align-items-center justify-content-space-evenly">
      <color-picker v-model="topNavBgColor"></color-picker>
      <div>
        <input
          id="interface_top_bar_bg_color"
          v-model="topNavBgColor"
          class="form-control"
          type="text"
          disabled
        />
      </div>
    </div>
    <p class="view-name mb-3">Select Side Bar Icons Color</p>
    <div class="d-flex align-items-center justify-content-space-evenly">
      <color-picker v-model="sideBarIconsColor"></color-picker>
      <div>
        <input
          id="interface_side_bar_icon_color"
          v-model="sideBarIconsColor"
          class="form-control"
          type="text"
          disabled
        />
      </div>
    </div>
  </div>
</template>

<script>
import ColorPicker from 'vue-color-picker-wheel'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'InterfaceComponent',
  components: { ColorPicker },
  data: () => ({
    googleAuthQr: '',
    qrScanned: false,
    color: '#000000'
  }),
  computed: {
    ...mapGetters({
      darkModeEnabled: 'userSettings/isDarkModeEnabled',
      getHeaderColor: 'userSettings/getHeaderColor',
      getSideBarIconsColor: 'userSettings/getSideBarIconsColor'
    }),

    topNavBgColor: {
      get() {
        return this.getHeaderColor
      },
      set(color) {
        this.setHeaderColor(color)
      }
    },
    sideBarIconsColor: {
      get() {
        return this.getSideBarIconsColor
      },
      set(color) {
        this.setSideBarIconsColor(color)
      }
    }
  },
  methods: {
    ...mapActions({
      toggleSetting: 'userSettings/toggleSetting'
    }),
    ...mapMutations('userSettings', ['setHeaderColor', 'setSideBarIconsColor'])
  }
}
</script>

<style scoped>
.justify-content-space-evenly {
  justify-content: space-evenly;
  flex-wrap: wrap;
}
</style>
