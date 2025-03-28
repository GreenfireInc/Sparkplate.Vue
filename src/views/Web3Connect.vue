<template>
  <div class="view container-fluid">
    <h1 class="view-name">Web3 Connect</h1>

    <!-- Select Method of Connecting -->
    <div class="row px-4">
      <!-- Wallet Connect -->
      <wallet-connect class="col" />

      <!-- Wallet Beacon -->
      <wallet-beacon class="col" />

      <!-- Quick History -->
      <quick-history class="col" />
    </div>
  </div>
</template>

<script>
// Vue Components
import WalletConnect from '@/components/web3Connect/connectionCards/WalletConnect.vue'
import WalletBeacon from '@/components/web3Connect/connectionCards/WalletBeacon.vue'
import QuickHistory from '@/components/web3Connect/DappQuickHistory.vue'

export default {
  name: 'DappConnect',
  components: { WalletBeacon, WalletConnect, QuickHistory },
  async mounted() {
    const history = this.$store.state.web3Connections.history
    if (history.length) return

    // load history on mount
    const loader = this.$loader()
    try {
      await this.$store.dispatch('web3Connections/loadRequestHistory')
    } catch (err) {
      console.error(err)
      this.$toast.error(err.message, 'Unable to load history')
    } finally {
      loader.hide()
    }
  }
}
</script>
