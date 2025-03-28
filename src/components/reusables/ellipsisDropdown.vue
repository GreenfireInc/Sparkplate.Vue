<!--
Contributors: Aciel Ochoa

Description: A reusable ellipsis dropdown component
-->

<template>
  <div :class="['dropdown', ...classes]">
    <img src="/assets/vectors/more.svg" alt=":" class="view-on-hover" />
    <div :class="['dropdown-menu', options.dropLeft ? 'drop-left' : '']">
      <span
        v-for="menuItem in menuItems"
        :key="menuItem.name + '-dropdown-menu'"
        v-ripple
        :class="[...menuItem.classes]"
        :v-if="menuItem.vIf"
        @click.stop="menuItem.click"
      >
        {{ menuItem.text }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EllipsisDropdown',
  props: {
    menuItems: {
      type: Array,
      required: true
    },
    classes: {
      type: Array,
      required: false,
      default: () => []
    },
    options: {
      type: Object,
      required: false,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  @apply relative;

  .dropdown-menu {
    @apply bg-white shadow-md flex-col absolute right-0  hidden rounded cursor-pointer  px-2 w-48;
    span {
      @apply py-1 pl-2 pr-5 select-none;
      &:hover {
        @apply bg-gray-100;
      }
    }
  }

  .drop-left {
    left: initial;
  }

  &:hover {
    .dropdown-menu {
      @apply flex;
    }
  }
}
</style>
