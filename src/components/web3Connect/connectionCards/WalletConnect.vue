<template>
  <div class="container-fluid p-1">
    <!-- Wallet Connect -->
    <h4 class="h4 mb-4">Wallet Connect:</h4>

    <!-- Select Method of Connecting -->
    <div v-if="view === 'main'">
      <sessions />
      <div>
        <button class="btn btn-primary" @click.prevent="initWalletConnect">
          Connect
        </button>
      </div>
    </div>

    <!-- Connection Form -->
    <form
      v-else-if="view === 'form'"
      class="container"
      @submit.prevent="beginHandshake"
    >
      <div class="input-field">
        <label for="connection-uri-input">Connection URI</label>
        <input id="connection-uri-input" v-model="uri" />
      </div>
      <div class="d-flex">
        <button class="btn btn-success" type="submit">Submit</button>
        <button
          class="btn btn-danger"
          type="button"
          @click="resetWeb3ConnectionPage"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
// Vue Components
import Sessions from '../walletConnect/Sessions.vue'

// Mixins
import accountMixins from '@/utils/mixins/accountMixins'
import ethGasPriceMixins from '@/utils/mixins/ethGasPriceMixins'

const initState = () => ({
  view: 'main',
  uri: ''
})

export default {
  name: 'WalletConnect',
  components: { Sessions },
  mixins: [accountMixins, ethGasPriceMixins],
  data: initState,
  methods: {
    resetWeb3ConnectionPage() {
      Object.assign(this.$data, initState())
    },
    changeView(view) {
      if (!view) throw new Error('No view provided.')
      this.view = view
    },
    initWalletConnect() {
      this.changeView('form')
    },
    beginHandshake() {
      if (!this.uri)
        return this.$toast.error(
          'No uri provided to connect with dApp.',
          'Cannot connect'
        )
      this.useWalletConnect()
    },
    async useWalletConnect() {
      // Handle all Wallet Connect actions using Vuex
      const dispatch = this.$store.dispatch

      // Perform pair request
      try {
        await dispatch('web3Connections/walletConnectPair', {
          uri: this.uri,
          // Pass modal and gtag for V1 compatibility
          modal: this.$modal,
          gtag: this.$gtag
        })
      } catch (err) {
        this.$toast.warning(err.message)
      } finally {
        this.resetWeb3ConnectionPage()
      }
    }
  }
}
</script>
