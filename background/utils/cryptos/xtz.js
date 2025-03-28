import tezos from '../blockchainApi/tezosInterface'
import Ed25519 from 'ed25519-hd-key'
import { b58cencode, prefix } from '@taquito/utils'
import bip39 from 'bip39'

export default {
  async generateWallet({ seed, derivationIndex }) {
    // Derive private key from seed
    const derivationPath = "m/44'/1729'/0'/" + derivationIndex + "'"
    const seedString = seed.toString('hex')
    const { key } = Ed25519.derivePath(derivationPath, seedString)
    const privateKey = this.encodePrivateKey(key)

    // Create wallet object
    const signer = await tezos.getSigner(privateKey)
    const address = await signer.publicKeyHash()
    const wallet = {
      address: address.toString('hex'),
      privateKey: privateKey,
      publicKey: await signer.publicKey(),
      derivationPath
    }

    return wallet
  },

  async generateBasicWallet() {
    // Derive new keys from a new mnemonic
    const mnemonic = bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
    const { key } = Ed25519.derivePath("m/44'/1729'/0'/0'", seed)
    const privateKey = this.encodePrivateKey(key)
    const signer = await tezos.getSigner(privateKey)
    const address = await signer.publicKeyHash()
    return {
      address: address.toString('hex'),
      privateKey: privateKey,
      publicKey: await signer.publicKey()
    }
  },

  encodePrivateKey(key) {
    return b58cencode(key.slice(0, 32), prefix.edsk2)
  },

  async importWallet({ privateKey }) {
    const signer = await tezos.getSigner(privateKey)
    const address = await signer.publicKeyHash()

    return {
      privateKey,
      publicKey: await signer.publicKey(),
      address: address.toString('hex')
    }
  },

  getBalance({ wallet, network }) {
    const { address } = wallet
    return tezos.getBalance({ address, network })
  },

  async estimateFee({ client, amount, toAddress }) {
    let fee = 0
    const revealEstimate = await client.estimate.reveal()
    const transferEstimate = await client.estimate.transfer({
      amount,
      to: toAddress
    })
    if (revealEstimate) fee += revealEstimate.suggestedFeeMutez
    fee += transferEstimate.suggestedFeeMutez

    return fee
  },

  async sendToAddress({ wallet, toAddress, amount = 0, network, fee }) {
    const signer = await tezos.getSigner(wallet.privateKey)
    const client = tezos.getInstance(network)
    client.setProvider({ signer })

    const op = await client.wallet
      .transfer({ to: toAddress, amount, fee })
      .send()
    return op.opHash
  }
}
