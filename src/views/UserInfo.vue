<template>
  <div class="view">
    <h1 class="view-name">User Details</h1>
    <!-- create tabs to switch from user status and qrcode components -->
    <TabsWrapper class="flex items-center text-xl font-semibold">
      <TabComponent
        v-for="(tab, tabIndex) in tabs"
        :key="`user-view_tab-${tabIndex}`"
        :on-click="() => (activeTab = tab)"
        :active="tab === activeTab"
        >{{ tab }}</TabComponent
      >
    </TabsWrapper>

    <div class="bg-white shadow py-5 px-4 mt-4">
      <!-- user status content -->
      <user-status v-if="activeTab === 'network'" />
      <!-- user status content -->

      <!-- qrcode content -->
      <qr-code v-if="activeTab === 'qrcode'" />
      <!-- qrcode content -->
    </div>
  </div>
</template>

<script>
import UserStatus from '@/components/NetworkAwareness/UserStatus.vue'
import QrCode from '@/components/NetworkAwareness/QrCode.vue'

export default {
  name: 'UserView',
  components: {
    UserStatus,
    QrCode
  },
  data: () => ({
    activeTab: 'network',
    tabs: ['network', 'qrcode']
  }),
  async mounted() {
    this.activeTab = 'network'
  }
}
</script>
