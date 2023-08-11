<!--
  File: QRCodeScan.vue
  Description: Component responsible for decoding QR codes.
  Author: Sean Irby
-->

<template>
  <div>
    <p class="text-xl mb-1">QR Code Scan</p>
    <button
      class="py-1 px-5 mt-4 mr-4 rounded text-white hover:shadow bg-blue-600 hover:bg-blue-700'"
      @click="useCamera = !useCamera"
    >
      Using Camera
    </button>

    <!-- File Capture -->
    <qrcode-capture :key="captureKey" @decode="onDecode" />

    <!-- Camera Stream -->
    <qrcode-stream
      class="w-25 mt-2"
      v-if="useCamera"
      @decode="onDecode"
      @init="onInit"
    />
    <p class="text-xl mt-2">Decoded Information: {{ decodedContent }}</p>
  </div>
</template>

<script>
import { QrcodeStream, QrcodeCapture } from 'vue-qrcode-reader'

export default {
  name: 'QRCodeScan',
  components: {
    QrcodeStream,
    QrcodeCapture
  },
  data() {
    return {
      decodedContent: null,
      useCamera: false,
      captureKey: 1
    }
  },
  methods: {
    onInit(promise) {
      promise.then(
        () => {
          console.log('Ready to decode QR code!')
        },
        (error) => {
          console.error(error.message)
          if (error.name === 'NotAllowedError') {
            // User denied camera access
            alert('You need to grant camera access to decode QR codes.')
          } else if (error.name === 'NotFoundError') {
            // No camera on this device
            alert('No camera found on this device.')
          }
        }
      )
    },
    onDecode(content) {
      this.useCamera = false
      this.decodedContent = content
      this.captureKey++
    }
  }
}
</script>
