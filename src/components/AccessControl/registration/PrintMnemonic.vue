<template>
  <canvas ref="canvasContainer" :width="width" :height="height" hidden />
</template>

<script>
const initialData = () => ({
  width: 1056,
  height: 816,
  backgroundPath: './assets/mnemonic/printCanvas.png'
})
export default {
  name: 'MnemonicPhraseCanvas',
  props: ['form'],
  data: initialData,
  computed: {
    canvas() {
      return this.$refs.canvasContainer
    },
    canvasContext() {
      return this.canvas.getContext('2d')
    },
    mnemonic() {
      return this.form.mnemonic.phrase.split(' ')
    }
  },
  mounted() {
    this.emitInterface()
  },
  methods: {
    emitInterface() {
      this.$emit('initPrint', () => {
        this.initPrint()
      })
    },
    async drawImage(path, x, y, width, height) {
      // Promise is resolved once image has been loaded and printed to canvas
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = path
        img.onload = () => {
          this.canvasContext.drawImage(img, x, y, width, height)
          resolve()
        }
        img.onerror = () => {
          reject(new Error(`Error loading ${path}`))
        }
      })
    },
    async initPrint() {
      await this.drawBackground()
      this.drawText()
      const { response } = await this.$dialog.showMessageBox({
        message:
          'Please keep this print out safe and secure. Store it behind a picture frame, in a safety deposit box or in between your mattress.',
        type: 'warning',
        buttons: ['Cancel', 'Continue']
      })

      if (response) this.printCanvas()
    },
    async drawBackground() {
      // draw background image for mnemonic phrase
      await this.drawImage(this.backgroundPath, 0, 0, this.width, this.height)
    },
    drawText() {
      this.canvasContext.textAlign = 'center'
      this.canvasContext.textBaseline = 'middle'

      // Mnemonic Phrase
      this.drawPhrase()

      // User Name/Email
      this.canvasContext.font = 'normal 14px Arial'
      this.canvasContext.fillStyle = '#000'
      const { firstname, lastname, email } = this.form
      const userFieldText = `${firstname.toLowerCase()}${
        lastname[0].toUpperCase() + lastname.slice(1).toLowerCase()
      }: ${email}`
      this.canvasContext.fillText(userFieldText, 337, 101)

      // Date
      this.canvasContext.font = 'normal 20px Arial'
      const date = this.$moment().format('MMMM Do YYYY')
      this.canvasContext.fillText(date, 310, 679)
    },
    drawPhrase() {
      const spacing = 120

      // Get center point of canvas
      let [x, y] = [this.width / 2, this.height / 2]
      // Starting x position will be 2.5 spacing to the left of center
      x = x - spacing * 2.5
      for (let i = 0; i < 6; i++) {
        // Print 1st and 7th word in this x position
        this.canvasContext.font = 'normal 26px Arial'
        this.canvasContext.fillStyle = '#000'
        this.canvasContext.fillText(this.mnemonic[i], x, y - 55)
        this.canvasContext.fillText(this.mnemonic[i + 6], x, y + 25)

        this.canvasContext.font = 'normal 18px Arial'
        this.canvasContext.fillStyle = '#666'
        this.canvasContext.fillText(i + 1, x, y - 25)
        this.canvasContext.fillText(i + 7, x, y + 55)
        x += spacing
      }
    },
    printCanvas() {
      const url = this.canvas.toDataURL()
      const element = `<img src="${url}" />`
      this.$exportAsPDF(
        'mnemonicPhrase.pdf',
        element,
        { type: 'print', settings: { pageSize: 'Letter', landscape: true } },
        (err) => {
          if (err) this.$toast.error(err.message, 'Error')
        }
      )
    }
  }
}
</script>
