<template>
  <div>
    <div v-if="views.includes(view)">
      <div v-if="warning" class="alert alert-warning">
        {{ warning }}
      </div>
      <div
        v-for="param in paramsFormatted"
        :key="'param-list-item-' + param.label"
      >
        <h6>
          <strong>{{ param.label }}</strong>
        </h6>
        <p class="param-value-container">
          {{ param.value }}
        </p>
      </div>
    </div>

    <div v-else>
      <p class="h6 warining">Sparkplate Cannot Perform the Requested Action.</p>
    </div>
  </div>
</template>

<script>
import { utils, providers } from 'ethers'
import walletConnect from '@/utils/web3Connect/walletConnect.js'

const {
  transactionRequests,
  typedRequests,
  signMessageRequests,
  sessionRequest,
  sessionProposal,
  otherRequests
} = walletConnect.requestTypes

const initState = () => ({
  views: [
    ...transactionRequests,
    ...typedRequests,
    ...signMessageRequests,
    ...otherRequests,
    sessionRequest,
    sessionProposal
  ]
})

export default {
  name: 'WalletConnectRequestDetails',
  props: {
    request: {
      type: Object,
      required: true
    },
    connector: {
      type: Object,
      required: false
    }
  },
  data: initState,
  computed: {
    view() {
      return this.request.method
    },
    method() {
      const isWcV1 = this.request.version === 'wc-1'
      const isSessionProposal = this.request.method === sessionProposal
      if (isWcV1 || isSessionProposal) {
        return this.request.method
      }
      return this.params.request.method
    },
    params() {
      return this.request.params
    },
    paramsFormatted() {
      const params = this.params

      if (this.view === sessionRequest) {
        if (this.request.version === 'wc-1') {
          const peer = params[0]
          const formatted = [
            this.format('ID:', peer.peerId),
            this.format('Chain:', this.requestedNetwork),
            this.format('Name:', peer.peerMeta.name),
            this.format('Description:', peer.peerMeta.description)
          ]
          return formatted
        } else if (this.request.version === 'wc-2') {
          const params = this.params.request.params
          const formatted = this.formatSessionRequest(this.method, params)
          return formatted
        }
      } else if (this.view === sessionProposal) {
        const peer = params.proposer.metadata

        // Format Namespaces
        const namespaces = params.requiredNamespaces.eip155
        const chains = namespaces.chains.map((chain) => {
          const [, chainId] = chain.split(':')
          const network = providers.getNetwork(parseInt(chainId))
          return network.name
        })

        const formatted = [
          this.format('Name:', peer.name),
          this.format('Description:', peer.description),
          this.format('Chains Requested:', chains),
          this.format('Methods:', namespaces.methods),
          this.format('Events:', namespaces.events)
        ]

        return formatted
      } else {
        return this.formatSessionRequest(this.method, this.params)
      }
      return []
    },
    requestedNetwork() {
      console.log('details: request: ', this.request)
      let chainName
      if (this.request.version === 'wc-1') {
        // Wallet Connect v1 Requests
        if (this.method === sessionRequest) {
          console.log('requestedNetwork: wc-1: sessionRequest...')
          // Session Request
          const peer = this.params[0]
          const chainId = peer.chainId

          // If chainId is not provied use user configured network
          if (!chainId) chainName = this.userNetwork
          else chainName = providers.getNetwork(parseInt(chainId)).name
        } else {
          const chainId = this.connector.chainId
          chainName = providers.getNetwork(parseInt(chainId)).name
        }
      } else {
        // Wallet Connect v2 Requests
        if (this.method !== sessionProposal) {
          const [, chainId] = this.params.chainId.split(':')
          chainName = providers.getNetwork(parseInt(chainId)).name
        }
      }

      this.$emit('getRequestedWalletConnectNetwork', chainName)
      return chainName
    },
    userNetwork() {
      return this.$store.state.userSettings.networkSelection.eth
    },
    warning() {
      if (!this.requestedNetwork) return ''
      if (this.userNetwork !== this.requestedNetwork) {
        return `Sparkplate is currently configured to the Ethereum network ${this.userNetwork}. The dApp requested this action be performed on the ${this.requestedNetwork} network. If approved Sparkplate will automatically switch to ${this.requestedNetwork}.`
      } else if (this.method === 'wallet_switchEthereumChain') {
        return `This dApp is requesting to switch Sparkplate's configured Ethereum network to ${this.requestedNetwork}.`
      }
      return ''
    }
  },
  methods: {
    format(label, value) {
      return { label, value } // return object with label/value keys
    },
    formatSessionRequest(method, params) {
      if (transactionRequests.includes(method)) {
        const tx = params[0]
        const formatted = []

        formatted.push(this.format('From', tx.from))
        if (tx.to) formatted.push(this.format('To', tx.to))
        if (tx.gasLimit)
          formatted.push(this.format('Gas Limit', parseInt(tx.gasLimit)))
        if (tx.gas) formatted.push(this.format('Gas', parseInt(tx.gas)))
        if (tx.gasPrice)
          formatted.push(this.format('Gas Price', parseInt(tx.gasPrice)))
        if (tx.nonce) formatted.push(this.format('Nonce', parseInt(tx.nonce)))
        if (tx.value) formatted.push(this.format('Value', parseInt(tx.value)))
        formatted.push(this.format('Data', tx.data))

        // Return formatted transaction request
        return formatted
      } else if (typedRequests.includes(method)) {
        // Return formatted typed request
        return [
          this.format('Address', params[0]),
          this.format('Data', JSON.stringify(params[1]))
        ]
      } else if (signMessageRequests.includes(method)) {
        const decode = (message) => {
          const messageArray = utils.arrayify(message)
          const messageText = Buffer.from(messageArray).toString()
          return messageText
        }
        // Return formatted typed request
        const [address, message] =
          method === 'personal_sign' ? [params[1], decode(params[0])] : params
        return [
          this.format('Address', address),
          this.format('Message', message)
        ]
      } else if (otherRequests.includes(method)) {
        // Format params for all other requests
        const formatted = []
        formatted.push(this.format('Method: ', method))

        if (method === 'wallet_switchEthereumChain') {
          const chainId = parseInt(this.params[0].chainId)
          const chainName = providers.getNetwork(chainId).name
          const chainNameFormatted = this.format('Chain: ', chainName)
          formatted.push(chainNameFormatted)
        } else {
          const paramsObjFormatted = this.format(
            'Params: ',
            JSON.stringify(this.params)
          )
          formatted.push(paramsObjFormatted)
        }
        console.log({ formatted })

        return formatted
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.param-value-container {
  max-height: 8rem;
  overflow: auto;
}
</style>
