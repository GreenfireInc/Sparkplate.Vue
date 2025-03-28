import Web3ConnectionService from '@/service/Web3ConnectionService'
import WalletConnect from '@/utils/web3Connect/walletConnect'
import WalletBeacon from '@/utils/web3Connect/walletBeacon'
import { eth } from '@/utils/cryptos/'
import Vue from 'vue'

const dbConnection = new Web3ConnectionService()

const initState = () => ({
  walletConnect: {
    web3wallet: null,
    sessions: {}
  },
  walletBeacon: {
    client: null,
    peers: {},
    permissions: {}
  },
  history: []
})

export default {
  namespaced: true,
  state: initState,
  mutations: {
    setWalletConnect(state, web3wallet) {
      state.walletConnect.web3wallet = web3wallet
    },
    setWalletConnectSession(state, session) {
      const topic = session.topic || session.handshakeTopic
      Vue.set(state.walletConnect.sessions, topic, session)
    },
    removeWalletConnectSession(state, topic) {
      Vue.delete(state.walletConnect.sessions, topic)
    },
    setWalletBeacon(state, client) {
      state.walletBeacon.client = client
    },
    setWalletBeaconPeers(state, peers) {
      // Add peers to state
      for (const peer in peers) {
        const p = peers[peer]
        Vue.set(state.walletBeacon.peers, p.senderId, p)
      }
    },
    setWalletBeaconPermissions(state, permissions) {
      // Add permissions to state
      for (const permission in permissions) {
        const p = permissions[permission]
        Vue.set(state.walletBeacon.permissions, p.senderId, p)
      }
    },
    removeWalletBeaconPermission(state, senderId) {
      Vue.delete(state.walletBeacon.permissions, senderId)
    },
    setHistory(state, history) {
      state.history = history
    },
    addToHistory(state, instance) {
      state.history = [instance, ...state.history]
    }
  },
  actions: {
    // Wallet Beacon Actions
    async walletBeaconInit({ commit, dispatch, state }, { modal, gtag }) {
      // Return if Beacon Client has already been initialized
      if (state.walletBeacon.client) return

      // Create and store Beacon Client
      const client = await WalletBeacon.initClient(modal, gtag, dispatch)
      commit('setWalletBeacon', client)

      // Add peers to state
      const peers = await client.getPeers()
      commit('setWalletBeaconPeers', peers)

      // Add permissions to state
      const permissions = await client.getPermissions()
      commit('setWalletBeaconPermissions', permissions)

      return client
    },
    async walletBeaconRemovePermission({ commit, state }, senderId) {
      const { permissions } = state.walletBeacon
      const permission = permissions[senderId]
      if (permission) {
        await WalletBeacon.removePermission(permission)
        commit('removeWalletBeaconPermission', senderId)
      }
    },
    async walletBeaconPair(_, { uri }) {
      await WalletBeacon.initPairing({ uri })
    },
    async handleWBRequest(
      { commit, state, rootGetters },
      { approved, request, wallet }
    ) {
      // Get network from permissions state
      const permission = state.walletBeacon.permissions[request.senderId]
      const isPermissionRequest =
        request.type === WalletBeacon.messageType.PermissionRequest
      if (!permission && !isPermissionRequest)
        throw new Error('Could not determine network to perform request on.')

      let network
      if (permission) {
        network = permission.network.type
        if (!isPermissionRequest)
          wallet = rootGetters['wallets/getWalletByAddress'](
            'xtz',
            permission.address
          )
      }

      const response = await WalletBeacon.handleRequest({
        approved,
        request,
        wallet,
        network
      })

      // If permission request was approved request new list of peers and permissions
      if (isPermissionRequest && approved) {
        const client = WalletBeacon.client
        const peers = await client.getPeers()
        commit('setWalletBeaconPeers', peers)
        const permissions = await client.getPermissions()
        commit('setWalletBeaconPermissions', permissions)
      }
      return response
    },
    // Wallet Connect Actions
    async handleWCSessionProposal(
      { commit, rootState },
      { approved, proposal, wallet }
    ) {
      // Check session prop version
      if (proposal.version === 'wc-1') {
        const requestedChainId = proposal.params[0].chainId
        const chainId =
          requestedChainId ||
          eth.getChainId(rootState.userSettings.networkSelection.eth)

        await WalletConnect.connector.approveSession({
          accounts: [wallet.address],
          chainId
        })
        commit('setWalletConnectSession', WalletConnect.connector)
      } else {
        const session = await WalletConnect.handleSessionProposal({
          approved,
          proposal,
          wallets: [wallet]
        })
        if (session) commit('setWalletConnectSession', session)
      }
    },
    async handleWCSessionRequest(
      { rootGetters, dispatch },
      { approved, request }
    ) {
      let wallet

      // Get Sparkplate Wallet Object if request is approved
      if (approved) {
        const method = request.params.request.method
        const params = request.params.request.params
        const address = WalletConnect.getAddressFromRequestParams(
          method,
          params
        )
        if (address)
          wallet = rootGetters['wallets/getWalletByAddress']('eth', address)
      }

      await WalletConnect.handleSessionRequest({
        approved,
        request,
        wallet,
        dispatch
      })
    },
    async handleWCCallRequest(
      { rootGetters, rootState },
      { approved, request }
    ) {
      let wallet, network
      if (approved) {
        const method = request.method
        const params = request.params
        const address = WalletConnect.getAddressFromRequestParams(
          method,
          params
        )
        if (address)
          wallet = rootGetters['wallets/getWalletByAddress']('eth', address)
        network = rootState.userSettings.networkSelection.eth
      }

      await WalletConnect.handleCallRequest({
        approved,
        request: {
          ...request,
          network
        },
        wallet
      })
    },
    async walletConnectInit({ commit, state, dispatch }, { modal, gtag }) {
      // Return if Web3Wallet(V2) has already been initialized
      if (state.walletConnect.web3wallet) return

      // Create and store instance of Web3Wallet
      const web3wallet = await WalletConnect.initWeb3Wallet(
        modal,
        gtag,
        dispatch
      )
      commit('setWalletConnect', web3wallet)
      const sessions = web3wallet.getActiveSessions()
      for (const session in sessions) {
        commit('setWalletConnectSession', sessions[session])
      }

      return web3wallet
    },
    async walletConnectPair({ dispatch }, { uri, modal, gtag }) {
      await WalletConnect.initPairing({ uri, modal, gtag, dispatch })
    },
    async walletConnectSessionDisconnect({ commit, state }, { topic }) {
      // Handle v1 sessions
      try {
        if (state.walletConnect.sessions[topic].version === 1) {
          const connector = state.walletConnect.sessions[topic]
          await connector.killSession()
        } else {
          await WalletConnect.sessionDisconnect(topic)
        }
      } catch (err) {
        console.error(err)
      } finally {
        commit('removeWalletConnectSession', topic)
      }
    },
    // Below are actions associated with all Web3Connections
    async endAllSessions({ state, dispatch }) {
      if (state.walletBeacon.connector) {
        await dispatch('walletBeaconDisconnect')
        state.walletBeacon.connector.destroy()
      }

      // update to end wallet connect sessions
      // if (state.walletConnect) state.walletConnect.killSession()
      state = { ...initState() }
    },
    async loadRequestHistory({ rootState, commit }) {
      const userId = rootState.accounts.active.id
      const history = await dbConnection.getUserHistory(userId)
      commit('setHistory', history)
    },
    async logRequest({ rootState, commit }, request) {
      const userId = rootState.accounts.active.id
      const data = {
        ...request,
        date: new Date()
      }
      await dbConnection.addRequest(data, userId)
      commit('addToHistory', data)
    },
    async performLogout({ dispatch, commit }) {
      await dispatch('endAllSessions') // end all active sessions
      commit('setHistory', []) // reset history state on logout
    }
  }
}
