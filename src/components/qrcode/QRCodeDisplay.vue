<!--
  File: QRCodeDisplay.vue
  Description: Component responsible for generating QR codes.
  Author: Sean Irby
-->

<template>
  <div>
    <p class="text-xl mb-1">QR Code Display</p>
    <div class="input-field col-md-6 pl-0 mt-4">
      <label for="settings_user-fname"> Enter text for QR Code </label>
      <input v-model="qrInput" type="text" />
    </div>
    <button
      class="py-1 px-5 mt-1 rounded text-white hover:shadow bg-blue-600 hover:bg-blue-700'"
      type="submit"
      @click="generateQR"
    >
      Display QR
    </button>
    <img v-if="qrData" :src="qrData" alt="Generated QR Code" />
    <div class="flex flex-col items-start">
      <button
        v-if="qrData"
        class="py-1 px-5 mt-1 rounded text-white hover:shadow bg-blue-600 hover:bg-blue-700'"
        @click="downloadQR('png')"
      >
        Download PNG
      </button>
      <button
        v-if="qrData"
        class="py-1 px-5 mt-1 rounded text-white hover:shadow bg-blue-600 hover:bg-blue-700'"
        @click="downloadQR('svg')"
      >
        Download SVG
      </button>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'QRCodeDisplay',
  data() {
    return {
      qrInput: '',
      qrData: null
    }
  },
  methods: {
    async generateQR() {
      this.qrData = await QRCode.toDataURL(this.qrInput)
    },
    downloadQR(format) {
      let link = document.createElement('a')
      link.download = `QRCode.${format}`

      if (format === 'png') {
        // this.qrData already contains a data URL for PNG
        link.href = this.qrData
      } else if (format === 'svg') {
        // Convert the PNG data URL to SVG (this is a basic example, you might need a library or more complex logic for this)
        let svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><image href="${this.qrData}" height="200" width="200"/></svg>`
        let blob = new Blob([svgData], { type: 'image/svg+xml' })
        link.href = URL.createObjectURL(blob)
      }

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>
