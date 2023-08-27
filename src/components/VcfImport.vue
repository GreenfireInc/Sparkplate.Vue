<template>
  <div class="vcf-import">
    <!-- <button class="import-title" @click="openUploadModal">Import VCF</button> -->
    <!-- Tried to use below component to render a modal but there is some issue, Need more time to debug -->
    <UploadModal v-if="showModal" @close="closeUploadModal"> </UploadModal>
    <label class="label">Upload a file(.vcf) below to generate QR code :</label>
    <input type="file" @change="handleFileUpload" accept=".vcf" />
    <div v-if="vcfData">
      <qrcode class="qrcode" :value="vcfData" :scale="10" />
    </div>
  </div>
</template>

<script>
import UploadModal from '@/components/UploadModal.vue' // Create a Modal component
import VueQrcode from 'vue-qrcode' // Import the qrcode library

export default {
  name: 'VcfImport',
  components: {
    UploadModal,
    qrcode: VueQrcode
  },
  data() {
    return {
      showModal: false,
      vcfData: null
    }
  },
  methods: {
    openUploadModal() {
      this.showModal = true
    },
    closeUploadModal() {
      this.showModal = false
      this.vcfData = null
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.vcfData = e.target.result
          this.generateQRCode(this.vcfData) // Generate QR code
        }
        reader.readAsText(file)
      }
    },
    async generateQRCode(data) {
      try {
        const qrDataURL = await VueQrcode.toDataURL(data) // Generate QR code URL
        this.vcfData = qrDataURL
      } catch (error) {
        console.error('QR code generation failed:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.vcf-import {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.vcf-import .import-title {
  font-size: large;
}
.dark-mode .vcf-import {
  color: black;
}
.qrcode {
  @apply relative;
}

.label {
  font-size: large;
  font-weight: 500;
}
</style>
