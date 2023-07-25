<!--
Contributors: Aciel Ochoa

Description: Modal component used for approving/rejecting call requests from connected dApps.
-->

<template>
  <modal
    name="dappCallRequestModal"
    classes="p-2"
    styles="overflow: visible"
    :width="800"
    height="auto"
    :click-to-close="false"
    :scrollable="true"
    @before-open="onModalOpen"
    @closed="onModalClose"
  >
    <div class="card">
      <div v-if="this.connector && this.request" class="row g-0">
        <div v-if="peerMeta.icons.length" class="col-4">
          <img
            :src="peerMeta.icons[0]"
            class="img-fluid rounded-start"
            :alt="peerMeta.name + '-icon'"
          />
        </div>
        <div class="col-8">
          <div class="card-body">
            <h5 class="card-title">
              {{ peerMeta.name }}
            </h5>
            <h6 class="card-subtitle text-muted capitalize">
              {{ requestName }}
            </h6>
            <div>
              <wallet-connect-request-details
                v-if="!isWalletBeacon"
                :request="request"
                :connector="connector"
                @getRequestedWalletConnectNetwork="
                  setRequestedWalletConnectNetwork
                "
              />
              <wallet-beacon-request-details v-else :request="request" />

              <!-- Wallet Selection For Wallet Connect -->
              <wallet-selection
                v-if="showWalletSelection"
                :wallets="walletSelectionCoinTicker"
                :handle-selection="selectWallet"
                placeholder="Select Wallet to Connect"
              />

              <div class="d-flex justify-space-around mt-4">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="!isApprovalReady"
                  @click.prevent="handleRequest(true)"
                >
                  Approve
                </button>
                <button
                  type="button"
                  class="btn btn-danger"
                  @click.prevent="handleRequest(false)"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import WalletConnectRequestDetails from './WalletConnectRequestDetails.vue'
import WalletBeaconRequestDetails from './WalletBeaconRequestDetails.vue'
import { BeaconMessageType } from '@airgap/beacon-sdk'
import WalletSelection from '@/components/reusables/Form/WalletSelection.vue'
import bugReporter from '@/logging/BugReporter'

const walletConnectRequests = {
  session_proposal: 'New Session',
  eth_sendTransaction: 'Send Transaction',
  eth_signTransaction: 'Sign Transaction',
  eth_signTypedData: 'Sign Typed Data',
  eth_sign: 'Sign',
  personal_sign: 'Personal Sign',
  wallet_switchEthereumChain: 'Switch Ethereum Chain'
}

const initState = () => ({
  request: null,
  connector: null,
  wallet: null,
  isWalletBeacon: false,
  requestedWalletConnectNetwork: null
})

export default {
  name: 'DappCallRequestModal',
  components: {
    WalletConnectRequestDetails,
    WalletBeaconRequestDetails,
    WalletSelection
  },
  data: initState,
  computed: {
    isApprovalReady() {
      // Used to disable approve button if requirements are not met
      let isReady = true
      if (this.showWalletSelection && !this.wallet) {
        isReady = false
      }
      return isReady
    },
    showWalletSelection() {
      // Show wallet selection if request is wallet connect session proposal or wallet beacon permission request
      const sessionProposal = this.request.method === 'session_proposal'
      const wc1SessionRequest =
        this.request.method === 'session_request' &&
        this.request.version === 'wc-1'
      const wbPermissionRequest =
        this.request.type === BeaconMessageType.PermissionRequest
      return sessionProposal || wc1SessionRequest || wbPermissionRequest
    },
    requestName() {
      if (this.isWalletBeacon) {
        // Format Wallet Beacon Request Name
        return this.request.type.replace(/_/g, ' ')
      } else if (this.request.version === 'wc-1') {
        // Format Wallet Connect V1 Request Name
        const method = this.request.method
        const requestName =
          method === 'session_request'
            ? 'New Session'
            : walletConnectRequests[method]
        return requestName
      } else {
        // Format Wallet Connect V2 Request Name
        if (this.request.method === 'session_proposal')
          return walletConnectRequests[this.request.method]
        const method = this.request.params.request.method
        return walletConnectRequests[method]
      }
    },
    peerMeta() {
      if (!this.request) return
      if (this.isWalletBeacon) {
        // Wallet Beacon Peer Meta
        const appMeta = this.request.appMetadata
        return {
          icons: [], // set empty array to avoid errors during render
          name: appMeta.name
        }
      } else if (this.request.version === 'wc-1') {
        // Wallet Connect V1 Peer Meta
        return this.connector.peerMeta
      } else if (this.request.method === 'session_proposal') {
        // Wallet Connect V2 Session Proposal Peer Meta
        return this.request.params.proposer.metadata
      } else if (this.request.method === 'session_request') {
        // Wallet Connect V2 Session Request Peer Meta
        const { sessions } = this.$store.state.web3Connections.walletConnect
        return sessions[this.request.topic].peer.metadata
      }
      return {
        icons: [],
        name: 'Peer Data Not Found'
      }
    },
    walletSelectionCoinTicker() {
      const wallets = this.$store.state.wallets
      if (!this.isWalletBeacon) return wallets.eth
      else return wallets.xtz
    }
  },
  methods: {
    selectWallet(wallet) {
      this.wallet = wallet
    },
    closeModal() {
      this.$modal.hide('dappCallRequestModal')
    },
    onModalOpen(event) {
      const { request, connector, wallet, isWalletBeacon } = event.params
      this.request = request
      this.connector = connector
      this.wallet = wallet
      this.isWalletBeacon = isWalletBeacon
    },
    onModalClose() {
      this.resetState()
    },
    displayError(err) {
      console.error('Error:: ', err)
      bugReporter.catchError(err)
      this.$toast.error(err.message, 'Error')
    },
    resetState() {
      Object.assign(this.$data, initState())
    },
    setRequestedWalletConnectNetwork(network) {
      this.requestedWalletConnectNetwork = network
    },
    handleRequest(userApproved) {
      if (this.isWalletBeacon) return this.handleWBRequest(userApproved)
      return this.handleWCRequest(userApproved)
    },
    async handleWCRequest(userApproved) {
      try {
        // Update configured network
        const userSelectedNetwork =
          this.$store.state.userSettings.networkSelection.eth
        const networksMatch =
          userSelectedNetwork === this.requestedWalletConnectNetwork
        const networkConfigNeeded =
          userApproved && this.requestedWalletConnectNetwork
        if (!networksMatch && networkConfigNeeded) {
          await this.$store.dispatch('userSettings/updateNetworkSelection', {
            coinTicker: 'eth',
            network: this.requestedWalletConnectNetwork
          })
        }

        if (this.request.method === 'session_request') {
          if (this.request.version === 'wc-1') {
            console.log('Handling WC-1 Session Request')
            await this.handleWCSessionProposal(userApproved)
          } else {
            await this.$store.dispatch(
              'web3Connections/handleWCSessionRequest',
              {
                approved: userApproved,
                request: this.request
              }
            )
          }
        } else if (this.request.method === 'session_proposal') {
          await this.handleWCSessionProposal(userApproved)
        } else {
          // Wallet Connect V1 Request Handler
          await this.$store.dispatch('web3Connections/handleWCCallRequest', {
            request: this.request,
            approved: userApproved
          })
        }

        // Display toast confirming user approval/rejection
        if (userApproved)
          this.$toast.success(`${this.requestName} request has been approved.`)
        else
          this.$toast.error(
            `${this.requestName} request has been rejected by user.`,
            'Rejected'
          )
      } catch (err) {
        this.displayError(err)
      } finally {
        this.closeModal()
      }
    },
    handleWCSessionProposal(userApproved) {
      if (this.request.version === 'wc-1' && !userApproved) {
        this.rejectWCRequest('Request was rejected.')
        this.connector.killSession()
      } else {
        if (!this.wallet.address)
          throw new Error('You must select a wallet to start a session.')
        this.$store.dispatch('web3Connections/handleWCSessionProposal', {
          approved: userApproved,
          wallet: this.wallet,
          proposal: this.request
        })
      }
    },
    rejectWCRequest(message) {
      this.connector.rejectRequest({
        id: this.request.id,
        error: {
          message: message
        }
      })
      this.closeModal()
    },
    async handleWBRequest(userApproved) {
      try {
        await this.$store.dispatch('web3Connections/handleWBRequest', {
          approved: userApproved,
          request: this.request,
          wallet: this.wallet
        })

        // format request success toast details
        let reqName = this.requestName
        reqName = reqName[0].toUpperCase() + reqName.slice(1)

        // Display toast confirming user approval/rejection
        if (userApproved)
          this.$toast.success(`${reqName} request has been approved.`)
        else
          this.$toast.error(
            `${reqName} request has been rejected by user.`,
            'Rejected'
          )

        this.closeModal()
      } catch (err) {
        this.displayError(err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#dapp-call-req-modal {
  overflow: visible;
}
</style>
