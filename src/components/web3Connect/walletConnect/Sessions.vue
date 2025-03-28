<template>
  <div>
    <div v-for="(session, topic) in sessions" :key="topic">
      <connection-card
        v-if="session.version === 1"
        :connection="session.peerMeta"
        :handle-disconnect="
          () => {
            handleDisconnect(topic)
          }
        "
      />
      <connection-card
        v-else
        :connection="session.peer.metadata"
        :handle-disconnect="
          () => {
            handleDisconnect(topic)
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
  name: 'WalletConnectSessions',
  components: { ConnectionCard },
  computed: {
    ...mapState({
      sessions: (state) => state.web3Connections.walletConnect.sessions
    })
  },
  methods: {
    handleDisconnect(topic) {
      this.$store.dispatch('web3Connections/walletConnectSessionDisconnect', {
        topic
      })
    }
  }
}
</script>
