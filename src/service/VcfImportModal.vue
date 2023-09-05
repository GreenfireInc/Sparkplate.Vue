<template>
  <div class="vcf-import-modal">
    <div class="modal-content">
      <h2>Import VCF File</h2>
      <input type="file" @change="handleFileUpload" accept=".vcf" />
      <div v-if="vcfData">
        <h3>Contact Information</h3>
        <pre>{{ vcfData }}</pre>
        <qrcode-vue :value="vcfData"></qrcode-vue>
      </div>
      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>

<script>
import { QrcodeVue } from 'vue-qrcode'

export default {
  name: 'VcfImportModal',
  components: {
    QrcodeVue
  },
  data() {
    return {
      vcfData: null
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
          this.vcfData = e.target.result
        }

        reader.readAsText(file)
      }
    },
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<!-- <style scoped>
.vcf-import-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

button {
  margin-top: 10px;
}
</style> -->
