<template>
  <aside v-if="loggedIn" :class="{ active }" class="widget side-pop">
    <div class="content">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img v-if="popIcon" class="mr-2 h-10" :src="popIcon" />
          <h2 class="text-xl text-blue-800 font-medium" v-text="title" />
        </div>
        <img
          class="cursor-pointer"
          src="/assets/vectors/close.svg"
          alt="close"
          @click="closePop"
        />
      </div>
      <div class="mt-10 px-2">
        <slot />
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: () => ' '
    },
    active: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => ''
    },
    popIcon: {
      type: String,
      default: () => ''
    }
  },
  methods: {
    closePop() {
      const { id } = this
      this.$emit('closeSidePop')
      this.$eventBus.$emit(id ? id + '-side-pop-close' : 'side-pop-close')
    }
  }
}
</script>

<style lang="scss" scoped>
.side-pop {
  @apply fixed top-0 right-0 h-full;
  width: 30rem;
  transform: translateX(100%);
  transition: transform ease-in-out 0.3s;
  // background-color: rgba(0, 0, 0, .1);

  &.active {
    transform: translateX(0);
  }

  .content {
    @apply max-w-lg bg-white ml-auto h-full shadow py-3 px-4;
  }
}
</style>
