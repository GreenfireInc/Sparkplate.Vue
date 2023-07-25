<template>
  <div class="container-fluid p-1">
    <!-- Wallet Beacon -->
    <h4 class="h4 mb-4">Wallet Beacon:</h4>

    <!-- Select Method of Connecting -->
    <div v-if="view === 'main'">
      <permissions />
      <div>
        <button class="btn btn-primary" @click.prevent="initWalletBeacon">
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
import Permissions from '../walletBeacon/Permissions.vue'

// Mixins
import accountMixins from '@/utils/mixins/accountMixins'

const initState = () => ({
  view: 'main',
  uri: '',
  connector: null
})

export default {
  name: 'WalletBeacon',
  components: { Permissions },
  mixins: [accountMixins],
  data: initState,
  methods: {
    resetWeb3ConnectionPage() {
      Object.assign(this.$data, initState())
    },
    changeView(view) {
      if (!view) throw new Error('No view provided.')
      this.view = view
    },
    initWalletBeacon() {
      this.connectionMethod = 'walletBeacon'
      this.changeView('form')
    },
    beginHandshake() {
      if (!this.uri)
        return this.$toast.error(
          'No uri provided to connect with dApp.',
          'Cannot Connect'
        )
      this.initPairing()
    },
    async initPairing() {
      try {
        await this.$store.dispatch('web3Connections/walletBeaconPair', {
          uri: this.uri
        })
      } catch (err) {
        this.$toast.error(err.message, 'Error Pairing')
      } finally {
        this.resetWeb3ConnectionPage()
      }
    }
  }
}
</script>
