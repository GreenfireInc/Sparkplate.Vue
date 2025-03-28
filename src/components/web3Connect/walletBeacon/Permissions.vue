<template>
  <div>
    <div v-for="(permission, senderId) in permissions" :key="senderId">
      <connection-card
        :connection="permission.appMetadata"
        :handle-disconnect="
          () => {
            removePermission(senderId)
          }
        "
      />
    </div>
  </div>
</template>

<script>
import ConnectionCard from '../ConnectionCard.vue'
import { mapState } from 'vuex'

export default {
  name: 'WalletBeaconSessions',
  components: { ConnectionCard },
  computed: {
    ...mapState({
      permissions: (state) => state.web3Connections.walletBeacon.permissions
    })
  },
  methods: {
    removePermission(senderId) {
      this.$store.dispatch(
        'web3Connections/walletBeaconRemovePermission',
        senderId
      )
    }
  }
}
</script>
