<template>
  <div>
    <div v-if="views.includes(view)">
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
// Types
import { BeaconMessageType } from '@airgap/beacon-sdk'

// Utils
import { bytes2Char } from '@taquito/utils'
import { utils } from 'ethers'

const {
  OperationRequest,
  BroadcastRequest,
  SignPayloadRequest,
  PermissionRequest
} = BeaconMessageType

const initState = () => ({
  views: [
    OperationRequest,
    BroadcastRequest,
    SignPayloadRequest,
    PermissionRequest
  ]
})

export default {
  name: 'WalletConnectRequestDetails',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  data: initState,
  computed: {
    view() {
      return this.request.type
    },
    userNetwork() {
      return this.$store.state.userSettings.networkSelection.xtz
    },
    requestedNetwork() {
      const permissions =
        this.$store.state.web3Connections.walletBeacon.permissions
      const permission = permissions[this.request.senderId]
      return permission.network.type
    },
    paramsFormatted() {
      const request = this.request

      let formatted
      switch (this.view) {
        case PermissionRequest:
          formatted = this.formatPermissionParams(request)
          break
        case OperationRequest:
          formatted = this.formatOperationParams(request)
          break
        case SignPayloadRequest:
          formatted = this.formatSignPayloadParams(request)
          break
        case BroadcastRequest:
          formatted = this.formatBroadcastParams(request)
          break
        default:
          formatted = []
      }

      return formatted
    }
  },
  methods: {
    format(label, value) {
      return { label, value } // return object with label/value keys
    },
    parseTez(amount) {
      return utils.formatUnits(amount, 6)
    },
    formatSigningMessage(request) {
      const decode = (payload) => {
        const messageBytes = payload.slice(12)
        const messageText = bytes2Char(messageBytes)
        console.log({ messageText })
        return messageText
      }

      let formatted
      switch (request.signingType) {
        case 'micheline':
          formatted = decode(request.payload)
          break
        default:
          formatted = request.payload
      }

      return formatted
    },
    formatPermissionParams(request) {
      const scopesFormatted = request.scopes.join(', ').replace(/_/g, ' ')
      return [
        this.format('Sender ID:', request.senderId),
        this.format('Name:', request.appMetadata.name),
        this.format('Requested Network:', request.network.type),
        this.format('Scopes:', scopesFormatted)
      ]
    },
    formatOperationParams(request) {
      const op = request.operationDetails[0]
      // Return formatted transaction request
      const formatted = [
        this.format('Type', op.kind),
        this.format('From', request.sourceAddress),
        this.format('To', op.destination),
        this.format('Amount', this.parseTez(op.amount) + ' tez'),
        this.format('Network', request.network.type)
      ]
      if (op.parameters) {
        const params = JSON.stringify(op.parameters)
        formatted.push(this.format('Parameters', params))
      }

      return formatted
    },
    formatSignPayloadParams(request) {
      return [this.format('Message', this.formatSigningMessage(request))]
    },
    formatBroadcastParams(request) {
      return [this.format('Signed Transaction', request.signedTransaction)]
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
