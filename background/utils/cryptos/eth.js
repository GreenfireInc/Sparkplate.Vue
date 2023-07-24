import infura from '../blockchainApi/infura'
import { Wallet, utils } from 'ethers'

export default {
  generateWallet({ seed, derivationIndex }) {
    const derivationPath = "m/44'/60'/0'/0/" + derivationIndex
    const hdNode = utils.HDNode.fromSeed(seed)
    const derived = hdNode.derivePath(derivationPath)

    // Construct Wallet Object
    const wallet = {
      privateKey: derived.privateKey,
      publicKey: derived.publicKey,
      address: derived.address,
      derivationPath
    }

    return wallet
  },

  generateBasicWallet() {
    const etherWallet = Wallet.createRandom()
    return {
      privateKey: etherWallet.privateKey,
      publicKey: etherWallet.publicKey,
      address: etherWallet.address
    }
  },

  async importWallet({ privateKey }) {
    const wallet = new Wallet(privateKey)
    const signingKey = wallet._signingKey()

    return {
      privateKey: signingKey.privateKey,
      publicKey: signingKey.compressedPublicKey,
      address: wallet.address
    }
  },

  getBalance({ wallet, network }) {
    const { address } = wallet
    return infura.getBalance({ address, network })
  },

  async sendToAddress({ wallet, toAddress, amount, gasPrice, network }) {
    const provider = infura.getProvider(network)

    // Get nonce, chainId, and build transaction
    const nonce = await provider.getTransactionCount(wallet.address, 'latest')
    const chainId = provider.network.chainId
    const tx = {
      chainId,
      nonce,
      from: wallet.address,
      to: toAddress,
      value: utils.parseUnits(amount.toString(), 'ether')
    }

    // Estimate gas and set gasLimit to tx
    const gasLimit = await provider.estimateGas(tx)
    tx.gasLimit = gasLimit
    tx.gasPrice = utils.parseUnits(gasPrice.toString(), 'gwei')

    // Sign and serialize transaction
    const ethersWallet = new Wallet(wallet.privateKey, provider)
    const signedTransaction = await ethersWallet.signTransaction(tx)

    // Push to blockchain and return TX ID
    const receipt = await provider.sendTransaction(signedTransaction)
    return receipt.hash
  }
}
