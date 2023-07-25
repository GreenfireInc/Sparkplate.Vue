<template>
  <div>
    <!-- Notifications -->
    <div>
      <div class="input-group">
        <label class="text-xl col-4" for="notificationsEnabled"
          >Notifications Enabled</label
        >
        <div class="d-flex items-center">
          <toggle-button
            class="text-xl"
            tag="notificationsEnabled"
            :value="userSettings.notificationsEnabled"
            color="#3182ce"
            @change="updateNotifications"
          />
        </div>
      </div>

      <div class="input-group">
        <label class="text-xl col-4" for="appToTrayEnabled"
          >Close To App Tray</label
        >
        <div class="d-flex items-center">
          <toggle-button
            class="text-xl"
            tag="appToTrayEnabled"
            :value="userSettings.appToTrayEnabled"
            color="#3182ce"
            @change="updateAppToTray"
          />
        </div>
      </div>

      <div class="input-group">
        <label class="text-xl col-4" for="bugTrackingEnabled"
          >Create a Backup</label
        >
        <button
          class="btn bg-blue-700 text-white px-2 py-1 m-0"
          @click="initBackup"
        >
          Begin
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import toastMixins from '@/utils/mixins/toastMixins'
import backupMixins from '@/utils/mixins/backupMixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'MiscSettings',
  components: {},
  mixins: [toastMixins, backupMixins],
  data: () => ({}),
  computed: {
    ...mapState(['userSettings'])
  },
  methods: {
    ...mapActions({
      toggleSetting: 'userSettings/toggleSetting'
    }),
    async initBackup() {
      const password = await this.collectEncryptionKeyToast(
        'Protect your backup with a password.'
      )
      if (password) this.createBackup(password)
    },
    updateNotifications(e) {
      const setting = e.tag
      this.toggleSetting(setting)
    },
    // tmr create custom function for bug tracking like below with ipc call
    updateAppToTray(e) {
      const setting = e.tag
      this.toggleSetting(setting)
      // console.log(e.value)
      // NOTE: Changes should take effect immediately so look into making ipcRenderer call in
      // /src/store/settingsModule.js after the update has gone through successfully
      const appToTrayEnabled = e.value
      // console.log('** Settings Misc userSettings appToTrayEnabled >>', appToTrayEnabled)
      window.ipcRenderer.send('setAppCloseToTray', appToTrayEnabled)
    }
  }
}
</script>
