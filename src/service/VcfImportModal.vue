<!-- <template>

</template> -->

<script>
import { QrCodeVue } from 'vue-qrcode'

export default {
  name: 'VcfImportModal',
  components: {
    QrCodeVue
  },
  data() {
    return {
      vcfData: null
    }
  },
  methods: {
    handleFileUploadEvent(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
          this.vcfData = e.target.result
        }

        reader.readAsText(file)
      }
    }
  }
}
</script>
