<!--
Contributors: Aciel Ochoa

Description: A wrapper for tab components to be placed inside of.\
  See Dashboard.vue for example
-->
<template>
  <div id="tabs-container" ref="tabContainer">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'TabsContainer'
}
</script>

<style lang="scss" scoped>
#tabs-container {
  @apply flex border-b border-gray-300;

  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    @apply bg-blue-600;
  }
  &::-webkit-scrollbar-track {
    @apply bg-gray-200;
  }
}
</style>
