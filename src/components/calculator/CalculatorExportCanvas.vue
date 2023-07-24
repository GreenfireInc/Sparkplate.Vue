<template>
  <canvas ref="canvasContainer" :width="width" :height="height" hidden />
</template>

<script>
import path from 'path'
import helpers from '@/utils/helper'

export default {
  name: 'CalculatorExportCanvas',
  props: ['args', 'solution'],
  data: () => ({
    ctx: null,
    canvasBgPath: './assets/calculator/calculatorCanvasBackground.png',
    width: 768,
    height: 1024,
    symbolSize: 45
  }),
  computed: {
    canvasCenter() {
      return Math.floor(this.width / 2)
    }
  },
  mounted() {
    this.emitInterface()
  },
  methods: {
    emitInterface() {
      this.$emit('initExport', () => {
        this.initExport()
      })
    },
    async initExport() {
      this.$gtag.event('calculator-export')
      const data = await this.getImageData()

      const { from, to } = this.args
      const filename = `${this.$moment().format('YYYYMMDD')}.${from.symbol}.${
        to.symbol
      }.Export.png`
      helpers.exportToPNG(data, filename)
    },
    async getImageData() {
      const canvas = this.$refs.canvasContainer
      this.ctx = canvas.getContext('2d')
      await this.drawToCanvas()
      return canvas.toDataURL('image/png')
    },
    async drawToCanvas() {
      // Draw entire image
      await this.drawBackground()
      await this.drawText()
      await this.drawSymbols()
    },
    async drawImage(path, x, y, width, height) {
      // Promise is resolved once image has been loaded and printed to canvas
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = path
        img.onload = () => {
          this.ctx.drawImage(img, x, y, width, height)
          resolve()
        }
        img.onerror = () => {
          reject(new Error(`Error loading ${path}`))
        }
      })
    },
    async drawBackground() {
      const bgPath = path.resolve(this.canvasBgPath)
      await this.drawImage(bgPath, 0, 0, this.width, this.height)
    },
    async drawText() {
      // draw date
      this.ctx.font = 'normal 26px Arial'
      const date = this.$moment().format('MMMM Do YYYY')
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(date, 557, 80)

      // draw Convert From & Into
      this.ctx.font = 'bold 36px Arial'
      const { from, to } = this.args
      this.ctx.textAlign = 'right'
      this.ctx.textBaseline = 'top'
      this.ctx.fillText('Convert From:', this.canvasCenter + 40, 260)
      this.ctx.fillText('Convert Into:', this.canvasCenter + 40, 360)
      this.ctx.textAlign = 'left'
      const symbolTextLeft = this.canvasCenter + 105
      this.ctx.fillText(from.symbol, symbolTextLeft, 260)
      this.ctx.fillText(to.symbol, symbolTextLeft, 360)

      // draw Conversions
      this.ctx.textAlign = 'center'
      const rate = `1 ${from.symbol} ≈ ${this.solution.rate.toFixed(6)} ${
        to.symbol
      }`
      this.ctx.fillText(rate, this.canvasCenter, 620)

      const conversion = `${this.args.amount} ${
        from.symbol
      } ≈ ${this.solution.amount.toFixed(6)} ${to.symbol}`
      this.ctx.fillText(conversion, this.canvasCenter, 740)
    },
    async drawSymbols() {
      const { from, to } = this.args
      const posX = this.canvasCenter + 50
      const baseUrl = path.resolve('./assets/cryptoicons/')
      // draw from symbol
      const fromPath = path.join(baseUrl, `${from.symbol.toLowerCase()}.svg`)
      await this.drawImage(
        fromPath,
        posX,
        260 - 7,
        this.symbolSize,
        this.symbolSize
      )
      // draw to symbol
      const toPath = path.join(baseUrl, `${to.symbol.toLowerCase()}.svg`)
      await this.drawImage(
        toPath,
        posX,
        360 - 7,
        this.symbolSize,
        this.symbolSize
      )
    }
  }
}
</script>
