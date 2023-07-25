import config from './config/maticConfig'
import ERC20Token from './ERC20Token.js'
const matic = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await matic.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await matic.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
