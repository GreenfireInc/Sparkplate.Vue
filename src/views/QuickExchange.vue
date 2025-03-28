<template>
  <div class="view">
    <div class="flex items-center uppercase font-semibold">
      <span
        v-for="(tab, tabIndex) in tabs"
        :key="`settings-view_tab-${tabIndex}`"
        :class="{
          'border-b-2 border-blue-700': tab === activeTab
        }"
        class="px-10 py-3 cursor-pointer"
        @click="activeTab = tab"
        v-text="tab"
      />
    </div>
    <changelly-component v-if="activeTab === 'Quick Exchange'" />
    <wert-component v-else-if="activeTab === 'Purchase'" />
  </div>
</template>

<script>
import ChangellyComponent from '@/components/quickExchange/Changelly.vue'
import WertComponent from '@/components/quickExchange/Wert.vue'

export default {
  name: 'QuickExchangePage',
  components: {
    ChangellyComponent,
    WertComponent
  },
  data: () => ({
    tabs: ['Quick Exchange', 'Purchase'],
    activeTab: 'Quick Exchange'
  })
}
</script>

<style lang="scss" scoped></style>
