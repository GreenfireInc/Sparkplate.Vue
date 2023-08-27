<template>
  <div class="view">
    <h1 class="view-name">Settings</h1>
    <network-status />
    <!-- settings tabs -->
    <TabsWrapper
      :class="[
        'flex items-center text-xl font-semibold',
        $store.state.darkMode ? 'text-black' : 'text-gray'
      ]"
    >
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

      <interface-settings v-if="activeTab === 'interface'" />

      <vcf-import v-if="activeTab === 'vcfimport'" />
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
import InterfaceSettings from '@/components/settings/InterfaceSettings.vue'
import VcfImport from '@/components/VcfImport.vue'

export default {
  name: 'SettingsView',
  components: {
    UserProfile,
    EmailSettings,
    SecuritySettings,
    Misc,
    NetworkStatus,
    VcfImport,
    InterfaceSettings
  },
  data: () => ({
    activeTab: 'user',
    tabs: ['user', 'security', 'email', 'misc', 'vcfimport', 'interface'],
    darkMode: false
  }),
  async mounted() {
    this.activeTab = this.$route.params.activeTab
  }
}
</script>

<style lang="scss" scoped>
.dark-mode .view {
  background-color: #11111179;
  color: #ffffff;
}
.dark-mode .view .tab-component {
  cursor: pointer;
  color: black;
}
</style>
