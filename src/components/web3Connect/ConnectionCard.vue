<template>
  <div class="card">
    <div class="row g-0">
      <div v-if="icon" class="col-4">
        <img
          :src="icon"
          class="img-fluid rounded-start"
          :alt="connection.name + '-icon'"
        />
      </div>
      <div class="col-8">
        <div class="card-body">
          <h5 class="card-title">
            {{ connection.name }}
          </h5>
          <h6 v-if="connection.id" class="card-subtitle text-muted">
            {{ connection.id }}
          </h6>
          <p v-if="connection.description" class="card-text">
            {{ connection.description }}
          </p>
          <div>
            <button class="btn btn-danger" @click.prevent="disconnect">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Web3ConnectionCard',
  props: {
    connection: {
      type: Object,
      required: true
    },
    handleConnectionRequest: {
      type: Function,
      required: false
    },
    handleDisconnect: {
      type: Function,
      required: false
    },
    connector: {
      type: Object,
      required: false
    }
  },
  computed: {
    icon () {
      const connection = this.connection
      if (connection.icon) return this.connection.icon // Wallet Beacon Icons
      else if (connection.icons && connection.icons.length) return connection.icons[0] // Wallet Connect Icons

      return '' // Fallback case
    }
  },
  methods: {
    disconnect () {
      // killSession is used for Wallet Connect, if method does not exist use WB dispatch
      if (this.handleDisconnect) return this.handleDisconnect()
      else if (!this.connector.killSession) {
        return this.$store.dispatch('web3Connections/walletBeaconDisconnect')
      }
    }
  }
}
</script>
