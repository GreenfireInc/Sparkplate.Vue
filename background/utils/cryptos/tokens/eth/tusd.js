import config from './config/tusdConfig'
import ERC20Token from './ERC20Token.js'
const tusd = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await tusd.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await tusd.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
