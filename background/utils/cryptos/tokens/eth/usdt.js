import config from './config/usdtConfig'
import ERC20Token from './ERC20Token.js'
const usdt = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await usdt.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await usdt.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
