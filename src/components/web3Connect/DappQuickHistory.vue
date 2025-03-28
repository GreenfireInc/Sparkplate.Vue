<template>
  <div class="container-fluid p-1">
    <div class="d-flex justify-between">
      <h4 class="h4 mb-4">Quick History</h4>
      <div class="btn-group">
        <button
          v-ripple="'rgba(255, 255, 255, .2)'"
          class="btn btn-secondary dropdown-toggle w-40"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          style="max-height: 40px"
          @click="showFilterOpts = !showFilterOpts"
        >
          {{ filterOpts[selectedFilterOpt] }}
        </button>
        <div
          class="dropdown-menu dropstart"
          :style="'display:' + (showFilterOpts ? 'block' : 'none') + ';'"
        >
          <a
            v-for="(name, value) of filterOpts"
            :key="`${value}-filter-option`"
            class="dropdown-item"
            href="#!"
            @click.prevent="filterBy(value)"
          >
            {{ name }}
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="requestHistory.length"
      class="w-100 list-group history-container"
    >
      <div
        v-for="request of requestHistory"
        :key="request.id"
        class="list-group-item"
      >
        <p
          class="capitalize mb-1"
          :class="[
            request.method === 'wallet_connect' ? 'eth-title' : '',
            request.method === 'wallet_beacon' ? 'xtz-title' : ''
          ]"
        >
          {{ formatMethod(request.method) }}
        </p>
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1 h5">
            {{ parseData(request.params).peerMeta.name }}
          </h5>
          <small>{{ formatRequestTimestamp(request.date) }}</small>
        </div>
        <p class="mb-1">Request ID: {{ parseData(request.params).id }}</p>
      </div>
    </div>
    <div v-else>No history to display.</div>
  </div>
</template>

<script>
import moment from 'moment'

const initState = () => ({
  showFilterOpts: false,
  filterOpts: {
    all: 'All',
    walletConnect: 'Wallet Connect',
    walletBeacon: 'Wallet Beacon'
  },
  selectedFilterOpt: 'all'
})

export default {
  name: 'DappQuickHistory',
  data: initState,
  computed: {
    requestHistory() {
      const history = this.$store.state.web3Connections.history
      const filterBy = this.selectedFilterOpt
      const types = {
        walletConnect: 'wallet_connect',
        walletBeacon: 'wallet_beacon'
      }

      const filtered = history.filter((log) => {
        if (filterBy === 'all') return log
        return types[filterBy] === log.method
      })

      return filtered
    }
  },
  methods: {
    formatMethod(method) {
      return method.replace(/_/g, ' ')
    },
    parseData(data) {
      return JSON.parse(data)
    },
    formatRequestTimestamp(date) {
      return moment(date).fromNow()
    },
    filterBy(type) {
      this.selectedFilterOpt = type
      this.showFilterOpts = false
    }
  }
}
</script>

<style lang="scss" scoped>
.history-container {
  height: 80vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    @apply bg-blue-600;
  }
  &::-webkit-scrollbar-track {
    @apply bg-gray-200;
  }
}
.eth-title::after {
  content: 'ETH';
}
.xtz-title::after {
  content: 'XTZ';
}
</style>
