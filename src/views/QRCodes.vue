<!--
Contributors: Tkxel
Description: This component handles the main view for QR Code retreival/generation module.
-->
<template>
  <div class="view">
    <div class="row">
      <div class="col-md-9">
        <p class="text-xl mb-5">QR Codes</p>
      </div>
    </div>
    <div class="w-full">
      <div>
        <!-- Action Buttons -->
        <div class="input-group flex">
          <div class="input-field col-md-6 pl-0">
            <button
              v-ripple="'rgba(255, 255, 255, .2)'"
              type="submit"
              class="btn bg-gray-400 text-black w-full justify-center"
              @click="openUploadModal('decode')"
            >
              Decode QR
            </button>
          </div>

          <div class="input-field col-md-6 pl-0">
            <button
              v-ripple="'rgba(255, 255, 255, .2)'"
              type="submit"
              class="btn bg-gray-400 text-black w-full justify-center"
              @click="openUploadModal('create')"
            >
              Create QR
            </button>
          </div>
        </div>
      </div>

      <!-- Placeholder for the QR Generated  -->
      <div>
        <figure
          v-if="codeIsReady"
          class="flex flex-column justify-content-center align-items-center mb-5"
        >
          <img id="scanned-qr" :src="generatedCodeURL" />
          <figcaption>
            The is the QR generated against the provided information.
          </figcaption>
        </figure>
      </div>

      <!-- Download button -->
      <div>
        <div
          class="dropdown flex flex-column justify-content-center align-items-center mb-5"
          v-if="codeIsReady"
        >
          <button
            id="importContactButton"
            v-ripple="'rgba(255, 255, 255, 0.35)'"
            class="btn rounded bg-gray-400"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            @click="toggleDownloadButtonMenu"
          >
            Download QR
            <import-icon class="icon" />
          </button>
          <ul
            class="dropdown-menu bg-gray-400"
            :class="downloadBtnMenuShow && 'show'"
            aria-labelledby="importQRCodeButton"
            v-click-outside="closeDownloadButtonMenu"
          >
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setDownloadFormat('png')"
              >
                PNG
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setDownloadFormat('svg')"
              >
                SVG
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <upload-code
        :qrCameraModalOpen="uploadModalOpen"
        @close-upload-modal="closeUploadModal"
        @qr-imported="handleImportedQR($event)"
        :openPath="selectedAction"
      ></upload-code>
    </div>
  </div>
</template>
<script>
import UploadCode from '../components/qrcodes/UploadQR.vue'
import ImportIcon from '../components/icons/Download.vue'
import ClickOutside from 'vue-click-outside'
import { toSvg } from 'html-to-image'

import QRCode from 'qrcode'

export default {
  name: 'UserProfile',
  components: {
    UploadCode,
    ImportIcon
  },
  directives: {
    ClickOutside
  },
  data: () => ({
    uploadModalOpen: false,
    codeIsReady: false,
    qrToShow: '',
    downloadBtnMenuShow: false,
    downloadFormat: 'png',
    selectedAction: 'decode'
  }),
  computed: {
    /*
     This computed property converts the parsed QR code into a PNG image, making it available for user visualization..
    */
    generatedCodeURL() {
      if (this.codeIsReady) {
        const canvas = document.createElement('canvas')
        QRCode.toCanvas(canvas, JSON.stringify(this.qrToShow), function () {})
        return canvas.toDataURL('image/png')
      } else {
        return ''
      }
    }
  },
  methods: {
    openUploadModal(path) {
      this.codeIsReady = false
      this.selectedAction = path
      this.uploadModalOpen = true
    },

    closeUploadModal() {
      this.uploadModalOpen = false
    },

    handleImportedQR(data) {
      this.codeIsReady = true
      this.uploadModalOpen = false
      this.qrToShow = data
    },

    /*
     This method handles the download functionality based on format selection by the user.
    */
    downloadQrCode(format) {
      const canvas = document.createElement('canvas')
      if (format === 'png') {
        QRCode.toCanvas(canvas, JSON.stringify(this.qrToShow), function () {
          const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
          const downloadLink = document.createElement('a')
          downloadLink.href = pngUrl

          downloadLink.download = `qrcode.png`
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        })
      } else {
        toSvg(document.getElementById('scanned-qr'), {}).then(
          function (dataUrl) {
            let svg = decodeURIComponent(dataUrl.split(',')[1])
            const base64doc = btoa(unescape(encodeURIComponent(svg)))
            const a = document.createElement('a')
            a.href = 'data:image/svg+xml;base64,' + base64doc
            a.download = 'qrcode.svg'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }
        )
      }
    },

    toggleDownloadButtonMenu(event) {
      event.cancelBubble = true
      this.downloadBtnMenuShow = !this.downloadBtnMenuShow
    },

    closeDownloadButtonMenu() {
      this.downloadBtnMenuShow = false
    },
    /*
     This method manages the download functionality, allowing users to select the desired format..
    */
    setDownloadFormat(format) {
      this.downloadFormat = format
      this.downloadBtnMenuShow = false
      this.downloadQrCode(format)
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown-menu {
  left: auto;
}
</style>
