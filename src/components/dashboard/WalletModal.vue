<template>
  <modal
    name="walletModal"
    height="auto"
    @before-open="onModalOpen"
    @closed="onModalClose"
  >
    <div v-if="wallet" class="container">
      <section class="details">
        Generated: {{ $moment(wallet.date).format('MMMM Do YYYY') }}<br />
        Type: {{ wallet.isHDWallet ? 'Trunk Wallet' : 'External' }}<br />
        <span>
          Balance: {{ wallet.balance }}
          <currency-symbol
            :symbol="wallet.coinTicker"
            :force-icon="true"
          /> </span
        ><br />
        Value:
        {{
          formatCurrencyWithSettings(
            currencyToGlobalValue(wallet.balance, wallet.coinTicker),
            5
          )
        }}
      </section>
      <section class="qrcode-container">
        <div class="qrcode">
          <img
            class="cryptoicon"
            width="45px"
            height="45px"
            :src="`./assets/cryptoicons/${wallet.coinTicker.toLowerCase()}.svg`"
            :alt="`${wallet.coinTicker.toLowerCase()}-icon`"
          />
          <vue-qrcode class="qrcode" :value="qrCodeAddress" :scale="10" />
        </div>
        <address>
          {{ prefixWithTicker ? tickerWithAddress(wallet) : wallet.address }}
        </address>
        <div class="prefix-toggle-container">
          <label>Prefix w/ Ticker</label>
          <toggle-button v-model="prefixWithTicker" color="#3182ce" />
        </div>
      </section>
    </div>
  </modal>
</template>

<script>
import VueQrcode from 'vue-qrcode'
import walletMixins from '@/utils/mixins/walletMixins'

const initialState = () => ({
  wallet: null,
  prefixWithTicker: true
})

export default {
  name: 'DashboardWalletModal',
  components: { VueQrcode },
  mixins: [walletMixins],
  data: initialState,
  computed: {
    qrCodeAddress() {
      return this.prefixWithTicker
        ? this.tickerWithAddress(this.wallet)
        : this.wallet.address
    }
  },
  beforeDestroy() {
    this.onModalClose()
  },
  methods: {
    onModalOpen(payload) {
      const { wallet } = payload.params
      this.wallet = wallet
    },
    onModalClose() {
      Object.assign(this.$data, initialState())
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  @apply p-8;

  .qrcode-container {
    @apply flex flex-col items-center;

    .qrcode {
      @apply relative;

      .cryptoicon {
        @apply absolute z-10;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .prefix-toggle-container {
      @apply flex justify-around items-center w-48;
    }
  }
}
</style>
