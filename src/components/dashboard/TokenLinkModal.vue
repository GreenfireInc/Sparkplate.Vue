<template>
  <modal
    name="tokenLinkModal"
    height="auto"
    classes="overflow-visible-important"
    @before-open="onModalOpen"
    @closed="onModalClose"
  >
    <div
      v-if="!throwawayWallet"
      class="bg-gray-100 p-3 d-flex flex-column align-items-center"
    >
      <h4 class="align-self-start mb-3">
        Choose an ETH Address to link with {{ activeCryptoInfo.symbol }}
      </h4>
      <wallet-selection
        v-if="walletSelection.length"
        :wallets="walletSelection"
        :handle-selection="linkWallet"
        placeholder="Select wallet to link"
        class="wallet-selection"
      />
      <div
        v-else-if="!ethWallets.length"
        class="alert alert-danger"
        role="alert"
      >
        You must first have an Ethereum Wallet!
      </div>
      <div v-else class="alert alert-danger" role="alert">
        All ETH wallets have been linked already!
      </div>
    </div>
    <div v-else class="bg-gray-100 p-3 d-flex flex-column align-items-center">
      <div class="m-3 py-3 alert alert-success">
        <h4 class="alert-heading h4">
          New {{ throwawayWallet.coinTicker }} address added to your dashboard.
        </h4>
        <p>
          Address {{ throwawayWallet.address }} will be linked to your
          {{ activeCryptoInfo.name }} wallet in a few seconds.
        </p>
      </div>
    </div>
  </modal>
</template>

<script>
import WalletSelection from '@/components/reusables/Form/WalletSelection.vue'

const initState = () => ({
  dropdownOpen: false,
  throwawayWallet: null
})

export default {
  name: 'TokenLinkModal',
  components: { WalletSelection },
  props: {
    activeCryptoInfo: {
      type: Object,
      required: true
    }
  },
  data: initState,
  computed: {
    coinTicker() {
      if (!this.activeCryptoInfo.symbol) return ''
      return this.activeCryptoInfo.symbol.toLowerCase()
    },
    linkedWallets() {
      return this.$store.state.wallets[this.coinTicker]
    },
    ethWallets() {
      return this.$store.state.wallets.eth
    },
    walletSelection() {
      if (!this.linkedWallets) return []
      // Filter out all ETH wallet that have previously been linked
      const linkedWallets = this.linkedWallets.map((w) => w.address)
      const remainingWallets = this.ethWallets.filter((w) => {
        const linked = linkedWallets.includes(w.address)
        return !linked
      })
      return remainingWallets
    }
  },
  methods: {
    async linkWallet(wallet) {
      const payload = {
        coinTicker: this.activeCryptoInfo.symbol,
        wallet
      }

      // Create loading screen begin adding ERC20 wallet
      const loader = this.$loader()
      try {
        await this.$store.dispatch('wallets/linkERC20Wallet', payload)
        this.$toast.success(
          `New ${this.activeCryptoInfo.symbol} wallet linked to address ${
            wallet.nickname || wallet.address
          }.`
        )
        this.$modal.hide('tokenLinkModal')
      } catch (err) {
        console.error(err)
        this.$toast.error(err.message, 'Wallet not saved')
      } finally {
        // close loader
        loader.hide()
      }
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    onModalOpen(payload) {
      const { throwawayWallet = false } = payload.params
      // If throwaway wallet is provided when modal is opened, link the erc20 wallet to that address
      if (throwawayWallet) {
        this.throwawayWallet = throwawayWallet
        setTimeout(() => {
          // Wait 6 seconds to allow use to read modal
          // Wallet will still link if modal is exited before
          this.linkWallet(throwawayWallet)
        }, 6000)
      }
    },
    onModalClose() {
      Object.assign(this.$data, initState())
    }
  }
}
</script>

<style lang="scss">
.overflow-visible-important {
  overflow: visible !important;
}
</style>

<style lang="scss" scoped>
.wallet-selection {
  width: 80%;
}
</style>
