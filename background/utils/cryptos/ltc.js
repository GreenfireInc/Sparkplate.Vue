import btcModule from './btc'
import bitcore from 'bitcore-lib'
import HdKey from 'hdkey'
import litecore from 'litecore-lib-v5'
import Blockchair from '../blockchainApi/blockchair'
const blockchair = new Blockchair()

export default {
  generateWallet({ seed, network, derivationIndex }) {
    const isMainnet = network === 'litecoin'

    if (isMainnet) {
      const HDPrivateKey = litecore.HDPrivateKey
      const hdMaster = HdKey.fromMasterSeed(seed)
      const retrieved = new HDPrivateKey(hdMaster.privateExtendedKey)
      const derivationPath = "m/44'/2'/0'/0/" + derivationIndex
      const derived = retrieved.deriveChild(derivationPath)

      return {
        privateKey: derived.privateKey.toString(),
        publicKey: derived.publicKey.toString(),
        wif: derived.privateKey.toWIF(),
        address: derived.privateKey.toAddress().toString(),
        derivationPath
      }
    } else {
      // LTC TESTNET WALLETS USE SAME PARAMS AS BTCTEST
      const { generateWallet } = btcModule
      const wallet = generateWallet({ seed, network, derivationIndex })
      return wallet
    }
  },

  generateBasicWallet({ network }) {
    const isMainnet = network === 'litecoin'
    const litecoinNetwork = isMainnet
      ? litecore.Networks.mainnet
      : litecore.Networks.testnet
    const privateKey = new litecore.PrivateKey(null, litecoinNetwork)
    const { publicKey } = privateKey
    const address = privateKey.toAddress()
    const wif = privateKey.toWIF()
    return {
      privateKey: privateKey.toString(),
      wif,
      publicKey: publicKey.toString(),
      address: address.toString(),
      balance: 0
    }
  },

  async importWallet({ wif, network }) {
    const isMainnet = network === 'litecoin'
    const litecoinNetwork = isMainnet
      ? litecore.Networks.mainnet
      : litecore.Networks.testnet
    const privateKey = new litecore.PrivateKey(wif, litecoinNetwork)
    const { publicKey } = privateKey
    const address = privateKey.toAddress()
    return {
      privateKey: privateKey.toString(),
      wif,
      publicKey: publicKey.toString(),
      address: address.toString(),
      balance: ''
    }
  },

  async getBalances({ addresses, network }) {
    const balances = await blockchair.getBalances({ addresses, network })
    // Format balances to BTC
    addresses.forEach((address) => {
      const balanceSats = balances[address]
      const balance = bitcore.Unit.fromSatoshis(balanceSats)
      balances[address] = balance.toBTC()
    })

    return balances
  },

  async sendToAddress({ wallet, toAddress, amount, fee = 0, network }) {
    const address = wallet.address
    const amountSats = bitcore.Unit.fromBTC(amount).toSatoshis()
    const feeSats = bitcore.Unit.fromBTC(fee).toSatoshis()

    // Get UTXOs
    const utxos = await blockchair.getUnspentOutputs({ address, network })
    if (!utxos.length)
      throw new Error('No unspent transactions. Cannot complete request.')
    const bitcoreUTXOs = utxos.map((utxo) => {
      return new bitcore.Transaction.UnspentOutput(utxo)
    })

    // Build Transaction
    const isMainnet = network === 'litecoin'
    const litecoinNetwork = isMainnet
      ? litecore.Networks.mainnet
      : litecore.Networks.testnet
    const privateKey = new litecore.PrivateKey(wallet.wif, litecoinNetwork)
    const tx = new litecore.Transaction()
    tx.from(bitcoreUTXOs)
    tx.to(toAddress, amountSats)
    if (feeSats) tx.fee(feeSats)
    tx.change(address)
    tx.sign(privateKey)

    // Push Transaction & return hash
    const txHash = tx.serialize()
    const txid = await this.postTransaction({ network, txHash })
    return txid
  },

  postTransaction({ network, txHash }) {
    return blockchair.sendTransaction({ network, txHash })
  }
}
