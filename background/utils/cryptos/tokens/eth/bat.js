import config from './config/batConfig'
import ERC20Token from './ERC20Token.js'
const bat = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await bat.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await bat.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
