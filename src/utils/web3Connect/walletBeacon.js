import {
  BeaconMessageType,
  BeaconErrorType,
  Serializer,
  WalletClient
} from '@airgap/beacon-sdk'
import tezosInterface from '../cryptos/blockchainApi/tezosInterface'

import app from '@/config/appMeta'
const appMetadata = {
  name: app.longName,
  appUrl: app.siteUrl,
  iconUrl: app.iconUrl
}

class WalletBeacon {
  constructor() {
    this.client = new WalletClient(appMetadata)
    this.dispatch = null
    this.serializer = new Serializer()
    this.messageType = BeaconMessageType
  }

  async initClient(modal, gtag, dispatch) {
    if (!this.dispatch) this.dispatch = dispatch
    await this.client.init()

    this.client
      .connect(async (request, connectionContext) => {
        console.info({ request, connectionContext })
        if (request.type === BeaconMessageType.PermissionRequest) {
          // If network not specified, use mainnet
          if (!request.network && !request.network.type) {
            request.network.type = 'mainnet'
          }

          // Log permission request to database and capture analytics
          const payload = {
            method: 'wallet_beacon',
            params: JSON.stringify({
              id: request.id,
              peerId: request.senderId,
              peerMeta: {
                name: request.appMetadata.name
              }
            })
          }
          this.dispatch('logRequest', payload)
          gtag.event('web3-connect-wallet-beacon-permission-request')
        }

        // Send request to dappCallReqestModal component
        const payload = {
          request,
          connector: this.client,
          isWalletBeacon: true
        }
        modal.show('dappCallRequestModal', payload)
      })
      .catch((error) => {
        console.error('connect error', error)
      })
    return this.client
  }

  async initPairing({ uri }) {
    const deserialized = await this.serializer.deserialize(uri)
    if (this.isBeaconMessage(deserialized)) {
      await this.client.addPeer(deserialized)
    } else {
      throw new Error(
        'Unable to add peer with provided connection message.',
        'Invalid connection'
      )
    }
  }

  isBeaconMessage(message) {
    const isValid =
      typeof message.name === 'string' &&
      typeof message.publicKey === 'string' &&
      typeof message.relayServer === 'string'
    if (!isValid) throw new Error('Could not validate beacon message.')
    return isValid
  }

  async handleRequest({ approved, request, wallet, network }) {
    // Create default rejected response
    let response = {
      type: BeaconMessageType.Error,
      id: request.id,
      errorType: BeaconErrorType.ABORTED_ERROR
    }

    if (approved) {
      // If user approved request, perform operation and update response
      const params = {
        wallet,
        network
      }

      // Get proper response for the requested operation
      response = await this.getRequestResponse(request, params)
    }

    return this.client.respond(response)
  }

  async getRequestResponse(request, params) {
    const type = request.type
    let response
    switch (type) {
      case BeaconMessageType.PermissionRequest:
        response = handlePermissionRequest(request, params)
        break
      case BeaconMessageType.SignPayloadRequest:
        // Sign request.payload and return signature
        response = await handleSignPayloadRequest(request, params)
        break
      case BeaconMessageType.OperationRequest:
        response = await handleOperationRequest(request, params)
        break
      case BeaconMessageType.BroadcastRequest:
        response = await handleBroadcastRequest(request, params)
        break
      default:
        response = {
          type: BeaconMessageType.Error,
          id: request.id,
          errorType: BeaconErrorType.ABORTED_ERROR
        }
    }
    return response
  }

  async removePermission(permission) {
    const accountIdentifier = permission.accountIdentifier
    await this.client.removePermission(accountIdentifier)
  }
}

function handlePermissionRequest(request, params) {
  return {
    type: BeaconMessageType.PermissionResponse,
    network: request.network, // Use the same network that the user requested
    scopes: request.scopes,
    id: request.id,
    publicKey: params.wallet.publicKey
  }
}

async function handleSignPayloadRequest(request, params) {
  const signer = await tezosInterface.getSigner(params.wallet.privateKey)
  const signedPayload = await signer.sign(request.payload)
  return {
    type: BeaconMessageType.SignPayloadResponse,
    id: request.id,
    signingType: request.signingType,
    signature: signedPayload.prefixSig
  }
}

async function handleOperationRequest(request, params) {
  // Prepare transaction based on the details give in request.operationDetails
  // request.operationDetails only contains a partial tezos transaction. Not all fields are mandatory
  // The fields that are not present (eg. counter, fee, gas_limit) have to be set by the wallet
  // If one of the optional fields is set, then that one should be used and not replaced by the wallet
  const opDetails = fillOperationDetails(request)
  const signer = await tezosInterface.getSigner(params.wallet.privateKey)

  const client = tezosInterface.getInstance(params.network)
  client.setProvider({ signer })
  const op = await client.wallet.transfer({ ...opDetails }).send()

  return {
    type: BeaconMessageType.OperationResponse,
    id: request.id,
    transactionHash: op.opHash
  }
}

async function handleBroadcastRequest(request, params) {
  const client = tezosInterface.getRpcClient(params.network)
  console.log({ client })
  const op = await client.injectOperation(request.signedTransaction)
  console.log({ op })

  return {
    type: BeaconMessageType.OperationResponse,
    id: request.id,
    transactionHash: op.opHash
  }
}

function fillOperationDetails(request) {
  if (request.operationDetails.length > 1)
    throw new Error('Cannot handle batch operations.')
  const op = request.operationDetails[0]

  const opDetails = {
    to: op.destination,
    amount: op.amount,
    fee: op.fee,
    gasLimit: op.gas_limit,
    mutez: true,
    parameter: op.parameters
  }

  return opDetails
}

export default new WalletBeacon()
