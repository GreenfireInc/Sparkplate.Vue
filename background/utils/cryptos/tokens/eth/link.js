import config from './config/linkConfig'
import ERC20Token from './ERC20Token.js'
const link = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await link.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await link.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
