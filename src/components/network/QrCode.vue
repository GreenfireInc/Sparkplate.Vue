<!--
  Contributor: PJ Singh

  Description: This component is used to generate a QR code from a vCard file (.vcf).
 -->
<template>
  <div class="flex flex-col items-center">
    <input type="file" @change="handleFileChange" />
    <!-- generate if qrCodeDataUrl is filled -->
    <div class="flex mt-6">
      <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" />
      <p v-else>Upload a VCard to generate a QR Code</p>
    </div>
  </div>
</template>

<script>
import vCardParser from 'vcard-parser'
import QRCode from 'qrcode'

export default {
  name: 'QrCode',
  data() {
    return {
      qrCodeDataUrl: ''
    }
  },
  methods: {
    async handleFileChange(event) {
      const file = event.target.files[0]

      if (file) {
        // Check if file is a .vcf file (vCard) and alert user if it is not.
        if (!file.name.toLowerCase().endsWith('.vcf')) {
          alert('Please select a vCard file (.vcf)')
          this.qrCodeDataUrl = ''
          return
        }
        // Read file
        const reader = new FileReader()
        reader.onload = async (e) => {
          // Parse vCard
          const content = e.target.result
          const parsedData = vCardParser.parse(content)
          const vCardText = vCardParser.generate(parsedData)

          // Generate QR Code
          const qrCodeCanvas = await QRCode.toCanvas(vCardText)
          this.qrCodeDataUrl = qrCodeCanvas.toDataURL()
        }
        reader.readAsText(file)
      }
    }
  }
}
</script>
