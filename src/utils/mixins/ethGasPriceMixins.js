/*
 * Contributors: Aciel Ochoa
 *
 * Description: Use this mixin on components needing access
 *   to ETH Gas Prices
 */
import { getEthTxFee } from '@/factory'

export default {
  data: () => ({
    ethGasPriceInterval: null
  }),
  computed: {
    gasPrices() {
      return this.$store.state.gasPrices
    }
  },
  methods: {
    async getEthTxFee(tx) {
      const { fee } = await getEthTxFee(tx)
      return fee
    },
    initFetchGasPrices() {
      const intervalId = setInterval(() => {
        this.$store.dispatch('fetchGasPrices')
      }, 30000) // fetch gas prices every 30 seconds
      this.ethGasPriceInterval = intervalId
    },
    stopFetchGasPrices() {
      if (this.ethGasPriceInterval) clearInterval(this.ethGasPriceInterval)
    }
  },
  beforeDestroy() {
    this.stopFetchGasPrices()
  }
}
