<template>
  <div class="view">
    <h1 class="view-name">Settings</h1>
    <network-status />
    <!-- settings tabs -->
    <TabsWrapper class="flex items-center text-xl font-semibold">
      <TabComponent
        v-for="(tab, tabIndex) in tabs"
        :key="`settings-view_tab-${tabIndex}`"
        :on-click="() => (activeTab = tab)"
        :active="tab === activeTab"
        >{{ tab }}</TabComponent
      >
    </TabsWrapper>
    <!-- settings tabs -->

    <div class="bg-white shadow py-5 px-4 mt-4">
      <!-- user content -->
      <user-profile v-if="activeTab === 'user'" />
      <!-- user content -->

      <!-- security content -->
      <security-settings v-if="activeTab === 'security'" />
      <!-- security content -->

      <!-- email content -->
      <email-settings v-if="activeTab === 'email'" />
      <!-- email content -->

      <misc v-if="activeTab === 'misc'" />
    </div>
  </div>
</template>

<script>
// Components
import UserProfile from '@/components/settings/UserProfile.vue'
import Misc from '@/components/settings/Misc.vue'
import SecuritySettings from '@/components/settings/SecuritySettings.vue'
import EmailSettings from '@/components/settings/EmailSettings.vue'
import NetworkStatus from '@/components/settings/NetworkStatus.vue'

export default {
  name: 'SettingsView',
  components: {
    UserProfile,
    EmailSettings,
    SecuritySettings,
    Misc,
    NetworkStatus
  },
  data: () => ({
    activeTab: 'user',
    tabs: ['user', 'security', 'email', 'misc']
  }),
  async mounted() {
    this.activeTab = this.$route.params.activeTab
  }
}
</script>

<style lang="scss" scoped></style>
