<template>
  <div class="import-container">
    <input
      class="file-input"
      type="file"
      accept=".vcf"
      @change="handleFileUpload"
    />
    <div v-if="contactInfo" class="contact-info">
      <h3>Imported Contact Information:</h3>
      <p>Name: {{ contactInfo.fn?.[0]?.value }}</p>
      <p>Email: {{ contactInfo.email?.[0]?.value }}</p>
      <p>Phone: {{ contactInfo.tel?.[0]?.value }}</p>
      <div class="qrcode-container">
        <div class="centered-qrcode">
          <qrcode :value="JSON.stringify(contactInfo)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/*
 * By: Joshua Medvinsky
 *
 * Description: This component takes in any vcf files (vcards) that are uploaded and converts them into
 * a Qrcode with the same information
 *
 */
import Qrcode from 'qrcode.vue'
import vcardparser from 'vcard-parser'

export default {
  name: 'NetworkImportTab',
  components: {
    Qrcode
  },
  data: () => ({
    contactInfo: null
  }),
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const fileContent = await this.readFile(file)
        console.log('File Content:', fileContent) // Log the file content
        var vcard = vcardparser.parse(fileContent)
        console.log(vcard.fn)
        console.log(vcard.email)
        console.log(vcard.tel)
        this.contactInfo = vcard
      } catch (error) {
        console.error('Error reading VCF file:', error)
      }
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = (error) => reject(error)
        reader.readAsText(file)
      })
    }
  }
}
</script>

<style scoped>
.import-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.file-input {
  margin-bottom: 20px;
}

.contact-info {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
}

.qrcode-container {
  margin-top: 20px;
}
</style>
