<!--
  File: InterfaceSettings.vue
  Description: Component responsible for changing colors of Top Bar and Side Nav.
  Author: Sean Irby
-->

<template>
  <div class="flex gap-10">
    <!-- Color Picker for the nav bar -->
    <div>
      <p class="text-xl mb-1">Color of the Top Bar</p>
      <chrome-picker v-model="navColor" />
    </div>
    <!-- Color Picker for the nav bar -->

    <!-- Color Picker for the side nav -->
    <div>
      <p class="text-xl mb-1">Color of the Side Nav</p>
      <chrome-picker v-model="asideColor" />
    </div>
    <!-- Color Picker for the side nav -->
  </div>
</template>

<script>
import { Chrome } from 'vue-color'

export default {
  name: 'InterfaceSettings',
  components: {
    'chrome-picker': Chrome
  },
  data() {
    return {
      navColor: '#3182ce',
      asideColor: '#fff'
    }
  },
  watch: {
    navColor(newColor) {
      document.body.style.setProperty('--nav-color', newColor.hex)
    },
    asideColor(newColor) {
      document.body.style.setProperty('--aside-color', newColor.hex)
    }
  }
}
</script>
