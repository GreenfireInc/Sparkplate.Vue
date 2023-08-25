<template>
  <div class="view">
    <h1 class="view-name">Network Awareness</h1>
    <TabsWrapper class="flex items-center text-xl font-semibold">
      <TabComponent
        :on-click="() => (activeTab = 'info')"
        :active="activeTab === 'info'"
        >Info</TabComponent
      >
      <TabComponent
        :on-click="() => (activeTab = 'import')"
        :active="activeTab === 'import'"
        >Import</TabComponent
      >
    </TabsWrapper>
    <div class="tab-content">
      <network-info-tab v-if="activeTab === 'info'" />
      <network-import-tab v-if="activeTab === 'import'" />
    </div>
  </div>
</template>

<script>
import NetworkInfoTab from '../components/network/NetworkInfoTab.vue'
import NetworkImportTab from '../components/network/NetworkImportTab.vue'
/*
 * By: Joshua Medvinsky
 *
 * Description: This view serves as a hub connecting two Network components, presenting them
 * as tabs on this page.
 *
 */
export default {
  name: 'NetworkAwareness',
  components: {
    NetworkInfoTab,
    NetworkImportTab
  },
  data: () => ({
    activeTab: 'info'
  })
}
</script>
