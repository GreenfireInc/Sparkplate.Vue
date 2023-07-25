import bitcore from 'bitcore-lib-doge'
import coinInfo from 'coininfo'
import CoinKey from 'coinkey'
import HdKey from 'hdkey'
import Blockchair from '../blockchainApi/blockchair'
const blockchair = new Blockchair()

export default {
  getDogeVersion(network) {
    const isMainnet = network === 'dogecoin'
    const dogeInfo = isMainnet
      ? coinInfo('DOGE').versions
      : coinInfo('DOGE-TEST').versions
    return dogeInfo
  },

  generateWallet({ seed, network, derivationIndex }) {
    // m/44'/3'/0'/0
    const isMainnet = network === 'dogecoin'
    const derivationPath = isMainnet
      ? `m/44'/3'/0'/0/${derivationIndex}`
      : `m/44'/1'/0'/0/${derivationIndex}`
    const version = this.getDogeVersion(network)

    const hdMasterKey = HdKey.fromMasterSeed(seed)
    const child = hdMasterKey.derive(derivationPath)
    const key = new CoinKey(child.privateKey, version)
    const wallet = {
      privateKey: key.privateKey.toString('hex'),
      publicKey: key.publicKey.toString('hex'),
      wif: key.privateWif,
      address: key.publicAddress,
      derivationPath
    }
    return wallet
  },

  generateBasicWallet({ network }) {
    const dogeVersion = this.getDogeVersion(network)
    const ck = CoinKey.createRandom(dogeVersion)
    return {
      privateKey: ck.privateKey.toString('hex'),
      publicKey: ck.publicKey.toString('hex'),
      wif: ck.privateWif,
      address: ck.publicAddress
    }
  },

  importFromPrivateKey({ privateKey, network }) {
    const dogeVersion = this.getDogeVersion(network)
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    return new CoinKey(privateKeyBuffer, dogeVersion)
  },

  importWallet({ wif, privateKey, network }) {
    let ck
    // Attempt import as WIF, import using privateKey and network
    try {
      ck = CoinKey.fromWif(wif)
    } catch (err) {
      ck = this.importFromPrivateKey({ privateKey, network })
    }

    const wallet = {
      privateKey: ck.privateKey.toString('hex'),
      publicKey: ck.publicKey.toString('hex'),
      wif: ck.privateWif,
      address: ck.publicAddress
    }
    return wallet
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
    const tx = await this.createTransaction({
      wallet,
      toAddress,
      amount,
      fee,
      network
    })
    const txHash = this.signTransaction({ wallet, tx })
    const txId = await this.postTransaction({ txHash, network })
    return txId
  },

  async createTransaction({ wallet, toAddress, amount, fee = 0, network }) {
    const { address } = wallet
    const amountSats = bitcore.Unit.fromBTC(amount).toSatoshis()
    const feeSats = bitcore.Unit.fromBTC(fee).toSatoshis()

    const utxos = await blockchair.getUnspentOutputs({ address, network })
    if (!utxos.length)
      throw new Error('No unspent transactions. Cannot complete request.')
    const bitcoreUTXOs = utxos.map((utxo) => {
      return new bitcore.Transaction.UnspentOutput(utxo)
    })

    const tx = new bitcore.Transaction()
    tx.from(bitcoreUTXOs)
    tx.to(toAddress, amountSats)
    if (feeSats) tx.fee(feeSats)
    tx.change(address)

    return tx
  },

  signTransaction({ wallet, tx }) {
    tx.sign(wallet.wif)
    const txHash = tx.serialize()
    return txHash
  },

  postTransaction({ network, txHash }) {
    return blockchair.sendTransaction({ network, txHash })
  }
}
