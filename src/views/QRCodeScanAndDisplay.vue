<!--
  File: QRCodeScanAndDisplay.vue
  Description: Main view for QR Code scanning and generation.
  Author: Sean Irby
-->

<template>
  <!-- Main view container -->
  <div class="view">
    <h1 class="view-name">QR Code Scan and Display</h1>
    <section class="mx-auto">
      <div class="flex flex-col">
        <!-- Decode Section -->
        <div class="bg-white shadow py-3 px-4">
          <q-r-code-scan />
        </div>
        <!-- Decode Section -->

        <!-- Generate QR Section -->
        <div class="bg-white shadow py-3 px-4 mt-4">
          <q-r-code-display />
        </div>
        <!-- Generate QR Section -->
      </div>
    </section>
  </div>
</template>

<script>
import QRCodeScan from '@/components/qrcode/QRCodeScan.vue'
import QRCodeDisplay from '@/components/qrcode/QRCodeDisplay.vue'

export default {
  name: 'QRCodeScanAndDisplay',
  components: {
    QRCodeScan,
    QRCodeDisplay
  }
}
</script>
