<template>
  <div class="wrapper">
    <div v-if="mode === 'selection'">
      <div class="my-3">
        <p>
          You can purchase crypto currencies directly using credit cards here.
        </p>
        <p>
          Please keep in mind the wallet you select for deposit is for the
          curreny you will be purchasing.
        </p>
      </div>
      <div>
        <wallet-selection
          :wallets="availableWallets"
          :handleSelection="handleSelection"
          placeholder="Please Select Address"
        />
        <button
          class="mt-3 btn bg-blue-600 text-white"
          type="button"
          @click="initWertWidget"
        >
          Continue
        </button>
      </div>
    </div>
    <div id="wert-container" />
  </div>
</template>

<script>
import WalletSelection from '@/components/reusables/Form/WalletSelection.vue'

import WertWidget from '@wert-io/widget-initializer'
// Docs at: https://github.com/wert-io/widget-initializer
// Notion Guide https://wert-io.notion.site/Wallet-top-up-step-by-step-3f998468821f4aa6bcfbab5838211db9

const initData = () => ({
  mode: 'selection',
  modes: ['selection', 'wert'],
  commodities: {
    btc: 'BTC',
    eth: 'ETH',
    usdc: 'USDC:ethereum',
    xtz: 'XTZ',
    usdt: 'USDT:ethereum'
  },
  options: {
    commodity: 'XTZ',
    address: 'tz1dvWyutq8twYRFHjWGq1zfd3Y4CbjZDgyY'
  }
})

export default {
  name: 'WertWidget',
  data: initData,
  components: { WalletSelection },
  computed: {
    availableWallets() {
      const filteredWallets = this.$store.getters.allWallets.filter(
        (wallet) => {
          return this.commodities[wallet.coinTicker.toLowerCase()]
        }
      )
      return filteredWallets
    }
  },
  methods: {
    initWertWidget() {
      this.mode = 'wert'
      const user = this.$store.state.accounts.active

      // Create Wert Widget
      const wertOptions = {
        ...this.options,
        partner_id: import.meta.env.VITE_WERT_PARTNER_ID,
        container_id: 'wert-container',
        origin: import.meta.env.VITE_WERT_ORIGIN,
        autosize: true,
        commodities: [this.options.commodity],
        phone: user.phone ? `1${user.phone}` : '',
        email: user.email
      }
      const wertWidget = new WertWidget(wertOptions)
      wertWidget.mount()
    },
    handleSelection(wallet) {
      this.options.commodity = this.commodities[wallet.coinTicker.toLowerCase()]
      this.options.address = wallet.address
    }
  }
}
</script>

<style scoped>
.wrapper {
  height: 90%;
}
#wert-container {
  height: 100%;
}
</style>
