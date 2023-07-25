import config from './config/gusdConfig'
import ERC20Token from './ERC20Token.js'
const gusd = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await gusd.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await gusd.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
