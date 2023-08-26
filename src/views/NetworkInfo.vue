<template>
  <div class="view">
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
// import userStatus from '@/components/networkAwareness/userStatus.vue'
// import qrCode from '@/components/networkAwareness/qrCode.vue'
import UserStatus from '@/components/network/NetworkStatus.vue'
import QrCode from '@/components/network/QrCode.vue'

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
