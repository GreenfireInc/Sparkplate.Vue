import config from './config/daiConfig'
import ERC20Token from './ERC20Token.js'
const dai = new ERC20Token(config.address, config.abi)

export default {
  async getBalance({ wallet }) {
    const balance = await dai.getBalance(wallet.address)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await dai.sendTransaction({ wallet, toAddress, amount })
    return txHash
  }
}
