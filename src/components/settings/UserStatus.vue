<!--
  Contributors: PJ Singh

  Description: This component will render the hostname of the machine, the current username, and local IP address
 -->

<template>
  <div>
    <div class="mb-2">
      <span class="font-bold">Hostname:</span>
      <span class="ml-1">{{ hostname }}</span>
    </div>
    <div class="mb-2">
      <span class="font-bold">Username:</span>
      <span class="ml-1">{{ username }}</span>
    </div>
    <div>
      <span class="font-bold">Local IP:</span>
      <span class="ml-1">{{ localIP }}</span>
    </div>
  </div>
</template>

<script>
// Utilities
import isOnline from 'is-online'
// import { ipcRenderer } from 'electron'
// import os from 'os'

const initData = () => ({
  hostname: '',
  isOnline: false,
  username: '',
  ip: ''
})

export default {
  name: 'MachineInfo',
  data: initData,
  computed: {
    user() {
      return this.loggedUserData
    },
    localIP() {
      return this.ip
    }
  },
  // on mount check if the user is online and if so, fetch the hostname of the machine, users username, and users local IP address
  async mounted() {
    this.isOnline = await isOnline()

    if (this.isOnline) {
      this.hostname = await window.app.getHostName()
      this.ip = await window.app.getLocalIP()
      this.username = await window.app.getUserName()
    }
  }
}
</script>
