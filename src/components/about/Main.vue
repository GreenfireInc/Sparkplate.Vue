<template>
  <div class="d-flex py-5 justify-around">
    <div class="col-6">
      <div class="center-content">
        <a href="https://www.greenfire.io" target="_blank">
          <img class="logo" src="/icon.png" alt="sparkplate-logo" />
        </a>
      </div>
    </div>
    <div class="col-6">
      <div class="center-content">
        <ul>
          <NetworkStatus :vertical="true" :hide-status="true" />
          <li v-if="os"><b>OS:</b> {{ os }}</li>
          <li v-if="nodeVersion"><b>Node:</b> {{ nodeVersion }}</li>
          <li v-if="electronVersion"><b>Electron:</b> {{ electronVersion }}</li>
          <li v-if="memorySize"><b>Installed RAM:</b> {{ memorySize }}</li>
          <li v-if="processor"><b>Processor:</b> {{ processor }}</li>
          <li v-if="gpu"><b>GPU:</b> {{ gpu }}</li>
          <li v-if="datetime"><b>Date/</b>Time: {{ datetime }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import NetworkStatus from '@/components/settings/NetworkStatus.vue'

export default {
  name: 'MainAbout',
  components: { NetworkStatus },
  data: () => ({
    datetime: '',
    electronVersion: '',
    gpu: '',
    memorySize: '',
    nodeVersion: '',
    os: '',
    processor: ''
  }),
  async created() {
    const appData = window.appData
    window.app.getGPUInfo().then((res) => {
      this.gpu = res.auxAttributes.glRenderer
    })
    this.datetime = this.$moment().format('MMM Do, YYYY H:mm')
    this.electronVersion = window.app.electronVersion
    this.memorySize = appData.systemMemory
      ? this.formatBytes(window.appData.systemMemory)
      : ''
    this.nodeVersion = window.app.nodeVersion
    this.os = appData.osVersion
    this.processor = appData.processor
  },
  methods: {
    formatBytes(bytes, decimals = 0) {
      if (!+bytes) return '0 Bytes'

      const kb = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

      const i = Math.floor(Math.log(bytes) / Math.log(kb))

      return `${parseFloat((bytes / Math.pow(kb, i)).toFixed(dm))} ${sizes[i]}`
    }
  }
}
</script>

<style lang="scss" scoped>
.center-content {
  @apply flex items-center justify-center h-full;
}

.logo {
  max-width: 14rem;
}
</style>
