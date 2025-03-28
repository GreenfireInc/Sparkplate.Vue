import config from './config/eurocConfig'
import ERC20Token from './ERC20Token.js'
const network = import.meta.env.VITE_EUROC_TESTNET || 'homestead'
const euroc = new ERC20Token(config.address[network], config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await euroc.getBalance(wallet.address, network)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await euroc.sendTransaction({
      wallet,
      toAddress,
      amount,
      network
    })
    return txHash
  }
}
