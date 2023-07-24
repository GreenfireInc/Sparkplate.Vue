<!--
Contributors: Aciel Ochoa

Description: A component for creating pre styled tabs.
  See Dashboard.vue for example
-->
<template>
  <div
    v-ripple="'rgba(0, 0, 0, 0.1)'"
    class="tab"
    :class="active ? 'active' : ''"
    @click.stop="onClick"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'TabComponent',
  props: ['active', 'onClick']
}
</script>

<style lang="scss" scoped>
.tab {
  @apply flex flex-col text-center border-blue-500 pt-3 px-4 pb-2 capitalize select-none;
  width: max-content;

  &:hover {
    @apply bg-white shadow-md cursor-pointer;
  }

  &.active {
    @apply border-b-2;
  }
}
</style>
