import { BigNumber, utils, providers } from 'ethers'

// Wallet Connect V1
import WalletConnectClient from '@walletconnect/client'
// Wallet Connect V2
import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'

import app from '@/config/appMeta'
import infura from '@/utils/cryptos/blockchainApi/infura'
import { eth } from '@/utils/cryptos/'

const walletConnectProjectID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

const sparkplateMetadata = {
  name: app.name,
  description: app.longName,
  icons: [app.iconUrl],
  url: app.siteUrl
}

// Core for V2
const walletConnectCore = new Core({
  projectId: walletConnectProjectID
})

class WalletConnect {
  constructor() {
    this.connector = null // V1
    this.web3wallet = null // V2
    this.dispatch = null
    this.requestTypes = {
      transactionRequests: ['eth_sendTransaction', 'eth_signTransaction'],
      typedRequests: ['eth_signTypedData'],
      signMessageRequests: ['eth_sign', 'personal_sign'],
      sessionRequest: 'session_request',
      sessionProposal: 'session_proposal',
      otherRequests: ['wallet_switchEthereumChain']
    }
  }

  // Create V1 Client
  initConnector(modal, gtag, dispatch, uri) {
    if (!this.dispatch) this.dispatch = dispatch
    this.connector = new WalletConnectClient({
      uri,
      clientMeta: { ...sparkplateMetadata }
    })

    if (this.connector.connected) {
      const topic = this.connector.handshakeTopic
      dispatch('walletConnectSessionDisconnect', { topic })
      this.connector.killSession()
      throw new Error(
        'Disconnecting an existing session, please try again or request a new uri from dApp.'
      )
    }

    // New Session event
    this.connector.on('session_request', (error, request) => {
      if (error) throw error

      gtag.event('web3-connect-wallet-connect-session-request')

      // format request data for database logging
      const payload = {
        method: 'wallet_connect',
        params: JSON.stringify({
          id: request.id,
          peerId: request.params[0].peerId,
          peerMeta: request.params[0].peerMeta
        })
      }
      // Log session request to database
      dispatch('logRequest', payload)

      // display modal
      modal.show('dappCallRequestModal', {
        request: { ...request, version: 'wc-1' },
        connector: this.connector
      })
    })

    // Request event
    this.connector.on('call_request', async (error, request) => {
      console.log('call_request: ', { request })
      if (error) throw error

      // Add required information to transaction object
      if (request.method === 'eth_sendTransaction') {
        const tx = request.params[0]
        request.params[0] = await this.buildTxDetails(tx)
      }

      modal.show('dappCallRequestModal', {
        request: { ...request, version: 'wc-1' },
        connector: this.connector
      })
    })

    // Store topic for use in disconnect event
    const start = uri.indexOf(':') + 1
    const end = uri.indexOf('@')
    const topic = uri.slice(start, end)

    // Disconnect Event
    this.connector.on('disconnect', async (error) => {
      if (error) throw error
      await dispatch('walletConnectSessionDisconnect', { topic })
    })
  }

  // Create or return instance of Web3Wallet
  async initWeb3Wallet(modal, gtag, dispatch) {
    if (!this.dispatch) this.dispatch = dispatch
    if (this.web3wallet) return this.web3wallet

    this.web3wallet = await Web3Wallet.init({
      core: walletConnectCore,
      metadata: { ...sparkplateMetadata }
    })

    // Assign hooks to handle WC requests
    this.setHooks(modal, gtag, dispatch)

    return this.web3wallet
  }

  // Start a new pairing/connection
  initPairing({ uri, modal, gtag, dispatch }) {
    // Get WalletConnect version to determine how pairing should be handled
    const version = this.getVersion(uri)
    if (version === '1') this.initConnector(modal, gtag, dispatch, uri)
    else if (version === '2') this.pairWeb3Wallet(uri)
    else
      throw new Error(
        'Sparkplate does not yet support this Wallet Connect version'
      )
  }

  getVersion(uri) {
    const versionIndex = uri.indexOf('@') + 1
    const version = uri[versionIndex]
    console.log('WC Version Received From URI: ', version)
    return version
  }

  pairWeb3Wallet(uri) {
    this.web3wallet.core.pairing.pair({ uri })
  }

  // Set listeners for Web3Wallet(V2)
  setHooks(modal, gtag, dispatch) {
    // session_proposal
    const sessionProposal = 'session_proposal'
    this.web3wallet.on(sessionProposal, async (proposal) => {
      gtag.event('web3-connect-wallet-connect-session-request')

      // format request data for database logging
      const payload = {
        method: 'wallet_connect',
        params: JSON.stringify({
          id: proposal.id,
          peerMeta: proposal.params.proposer.metadata
        })
      }
      // Log session request to database
      dispatch('logRequest', payload)

      // display modal
      modal.show('dappCallRequestModal', {
        request: { ...proposal, method: sessionProposal, version: 'wc-2' },
        connector: this.web3wallet
      })
    })

    const sessionRequest = 'session_request'
    this.web3wallet.on(sessionRequest, async (request) => {
      console.log('session_request: ', { request })
      // display modal
      modal.show('dappCallRequestModal', {
        request: { ...request, method: sessionRequest, version: 'wc-2' },
        connector: this.web3wallet
      })
    })

    this.web3wallet.on('session_delete', async (payload) => {
      const topic = payload.topic
      await dispatch('walletConnectSessionDisconnect', { topic })
    })
  }

  // Approve or Reject Web3Wallet Session
  async handleSessionProposal({ approved, proposal, wallets }) {
    const { id, params } = proposal

    // Reject Session
    if (!approved) {
      const session = await this.web3wallet.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED_METHODS')
      })
      return session
    }

    // Build EIP-155 Accounts ("eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb")
    const accounts = []
    params.requiredNamespaces.eip155.chains.forEach((chain) => {
      wallets.forEach((wallet) => {
        const eip155AccountString = chain + ':' + wallet.address
        accounts.push(eip155AccountString)
      })
    })

    // Build Approved Namespaces Object
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          ...params.requiredNamespaces.eip155,
          accounts
        }
      }
    })

    // Approve Session
    const session = await this.web3wallet.approveSession({
      id,
      namespaces: approvedNamespaces
    })

    return session
  }

  async sessionDisconnect(topic) {
    await this.web3wallet.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED')
    })
  }

  async handleCallRequest({ approved, request, wallet }) {
    // Handle Wallet Connect V1 Call Requests
    const id = request.id
    if (!approved) {
      // Reject request if not approved
      return this.connector.rejectRequest({
        id,
        error: {
          message: 'User rejected request'
        }
      })
    }

    // Process request
    const method = request.method
    const params = request.params
    const network = request.network
    const result = await ethMethods[method]({
      dispatch: this.dispatch,
      network,
      params,
      wallet
    })
    this.connector.approveRequest({ id, result })
  }

  async handleSessionRequest({ approved, dispatch, request, wallet }) {
    let response

    if (!approved) {
      // If not approved create Error response
      response = {
        id: request.id,
        jsonrpc: '2.0',
        error: {
          code: 5000,
          message: 'User rejected.'
        }
      }
    } else {
      // Process request and create response
      const method = request.params.request.method
      const params = request.params.request.params
      const [, chainId] = request.params.chainId.split(':')
      const network = providers.getNetwork(parseInt(chainId))
      const result = await ethMethods[method]({
        wallet,
        params,
        network: network.name,
        dispatch
      })
      response = {
        id: request.id,
        jsonrpc: '2.0',
        result
      }
    }

    const topic = request.topic
    return this.web3wallet.respondSessionRequest({ topic, response })
  }

  getAddressFromRequestParams(method, params) {
    const requestTypes = this.requestTypes

    // Determine where address is listed in params based on request method
    if (requestTypes.transactionRequests.includes(method)) {
      const address = params[0].from
      return address
    } else if (requestTypes.typedRequests.includes(method)) {
      const address = params[0]
      return address
    } else if (requestTypes.signMessageRequests.includes(method)) {
      const address = method === 'personal_sign' ? params[1] : params[0]
      return address
    }
  }

  async buildTxDetails(tx) {
    if (!tx.gasPrice) tx.gasPrice = this.gasPrices.average
    if (!tx.nonce)
      tx.nonce = await eth.getNonce({
        address: tx.from,
        network: this.ethNetwork
      })
    if (!tx.chainId) tx.chainId = eth.getChainId(this.ethNetwork)
    return tx
  }
}

const ethMethods = {
  async eth_sendTransaction({ wallet, params, network }) {
    // Create transaction object with valid ethers parameters
    const provider = await infura.getProvider(network)
    const tx = await parseTxFromParams(params, provider)

    // Create signer instance & sign transaction
    const privateKey = wallet.privateKey
    const signer = infura.getSigner({ privateKey, network })
    const signedTx = await signTx({ tx, signer })

    // Push transaction to blockchain
    const receipt = await provider.sendTransaction(signedTx)
    return receipt.hash
  },
  async eth_signTransaction({ wallet, params, network }) {
    const tx = await parseTxFromParams(params)
    const privateKey = wallet.privateKey
    const signedTx = await signTx({ privateKey, tx, network })
    return signedTx
  },
  async eth_signTypedData({ wallet, params, network }) {
    // Extract data from params
    const typedData = JSON.parse(params[1])
    const { types, domain, message } = typedData

    // create signer
    const privateKey = wallet.privateKey
    const signer = infura.getSigner({ privateKey, network })

    // Sign and return typed data
    const signed = await signer._signTypedData(domain, types, message)
    return signed
  },
  async eth_sign({ wallet, params, network }) {
    const privateKey = wallet.privateKey
    // extract message from params
    const message = params[1]
    const hexStringArray = utils.arrayify(message)
    // sign and return
    const signer = infura.getSigner({ privateKey, network })
    const signed = await signer.signMessage(hexStringArray)
    return signed
  },
  async personal_sign({ wallet, params, network }) {
    const privateKey = wallet.privateKey
    // extract message from params
    const message = params[0]
    const hexStringArray = utils.arrayify(message)
    // sign and return
    const signer = infura.getSigner({ privateKey, network })
    const signed = await signer.signMessage(hexStringArray)
    return signed
  },
  async wallet_switchEthereumChain({ dispatch, params }) {
    const chainId = parseInt(params[0].chainId)
    const chain = providers.getNetwork(chainId)
    await dispatch(
      'userSettings/updateNetworkSelection',
      { coinTicker: 'eth', network: chain.name },
      { root: true }
    )
    return null
  }
}

async function parseTxFromParams(params, provider) {
  // Create an object copy of transaction
  const tx = JSON.parse(JSON.stringify(params[0]))
  if (tx.nonce) tx.nonce = parseInt(tx.nonce)
  else tx.nonce = await provider.getTransactionCount(tx.from, 'latest')

  if (tx.gas) {
    tx.gasLimit = BigNumber.from(tx.gas)
    delete tx.gas
  }
  if (tx.gasPrice) tx.gasPrice = BigNumber.from(tx.gasPrice)
  if (tx.value) tx.value = BigNumber.from(tx.value)

  return tx
}

async function signTx({ privateKey, tx, network, signer }) {
  const wallet = !signer ? infura.getSigner({ privateKey, network }) : signer
  const signedTransaction = await wallet.signTransaction(tx)
  return signedTransaction
}

export default new WalletConnect()
