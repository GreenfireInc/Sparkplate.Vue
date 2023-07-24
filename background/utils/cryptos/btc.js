/*
 * Contributors: Aciel Ochoa
 *
 * Description: Bitcoin API for creating/importing wallets and performing transactions
 *
 * Process: Background
 */
import bitcoin from 'bitcoinjs-lib'
import bitcore from 'bitcore-lib'
import Blockchair from '../blockchainApi/blockchair'
const blockchair = new Blockchair()

export default {
  generateWallet({ seed, derivationIndex, network }) {
    // Determine configuration for wallet
    const isMainnet = network === 'bitcoin'
    const derivationPath = !isMainnet
      ? "m/44'/1'/0'/0/" + derivationIndex
      : "m/44'/0'/0'/0/" + derivationIndex

    // Setup options and generate wallet
    const bitcoinNetwork = isMainnet
      ? bitcoin.networks.mainnet
      : bitcoin.networks.testnet
    const hdMaster = bitcoin.bip32.fromSeed(Buffer.from(seed), bitcoinNetwork)
    const key = hdMaster.derivePath(derivationPath)
    const address = bitcoin.payments.p2pkh({
      pubkey: key.publicKey,
      network: bitcoinNetwork
    }).address

    // Create and return wallet object
    const wallet = {
      privateKey: key.privateKey.toString('hex'),
      publicKey: key.publicKey.toString('hex'),
      wif: key.toWIF(),
      address,
      derivationPath
    }

    return wallet
  },

  generateBasicWallet({ network }) {
    const isMainnet = network === 'bitcoin'
    const bitcoinNetwork = isMainnet
      ? bitcoin.networks.mainnet
      : bitcoin.networks.testnet
    const key = bitcoin.ECPair.makeRandom({ network: bitcoinNetwork })
    const { address } = bitcoin.payments.p2pkh({
      pubkey: key.publicKey,
      network: bitcoinNetwork
    })

    // Create and return wallet object
    const wallet = {
      privateKey: key.privateKey.toString('hex'),
      publicKey: key.publicKey.toString('hex'),
      wif: key.toWIF(),
      address
    }

    return wallet
  },

  importWallet({ wif, privateKey, network }) {
    const isMainnet = network === 'bitcoin'
    const bitcoinNetwork = isMainnet
      ? bitcoin.networks.mainnet
      : bitcoin.networks.testnet
    try {
      // Attempt to import WIF
      if (!wif) throw new Error('WIF not provided.')
      const key = bitcoin.ECPair.fromWIF(wif, bitcoinNetwork)
      const { address } = bitcoin.payments.p2pkh({
        pubkey: key.publicKey,
        network: key.network
      })
      const wallet = {
        privateKey: key.privateKey.toString('hex'),
        publicKey: key.publicKey.toString('hex'),
        address,
        wif
      }

      return wallet
    } catch (err) {
      // If WIF fails, import as privateKey
      console.error(err)
      const key = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey), {
        network: bitcoinNetwork
      })
      const { address } = bitcoin.payments.p2pkh({
        pubkey: key.publicKey,
        network: bitcoinNetwork
      })

      const wallet = {
        privateKey: key.privateKey.toString('hex'),
        publicKey: key.publicKey.toString('hex'),
        wif: key.toWIF(),
        address
      }

      return wallet
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

  async sendToAddress({
    wallet,
    toAddress,
    changeAddress,
    amount = 0,
    network
  }) {
    const satsAmount = bitcore.Unit.fromBTC(amount).toSatoshis()

    // Get UTXOs and wallet fromWIF
    const utxos = await blockchair.getUnspentOutputs({
      address: wallet.address,
      network
    })
    if (!utxos.length)
      throw new Error('No unspent transactions. Cannot complete request.')
    const bitcoreUTXOs = utxos.map((utxo) => {
      return new bitcore.Transaction.UnspentOutput(utxo)
    })

    // Build transaction
    const tx = new bitcore.Transaction()
    tx.from(bitcoreUTXOs)
    tx.to(toAddress, satsAmount)
    tx.change(changeAddress || wallet.address)
    tx.sign(wallet.wif)
    const txHash = tx.serialize()

    const txid = await this.postTransaction({ network, txHash })
    return txid
  },

  postTransaction({ txHash, network }) {
    return blockchair.sendTransaction({ network, txHash })
  }
}
