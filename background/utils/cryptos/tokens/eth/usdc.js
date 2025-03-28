import config from './config/usdcConfig'
import ERC20Token from './ERC20Token.js'
const network = import.meta.env.VITE_USDC_TESTNET || 'homestead'
const usdc = new ERC20Token(
  config.address[network],
  config.abi,
  config.implementation[network]
)

export default {
  async getBalance({ wallet }) {
    const balance = await usdc.getBalance(wallet.address, network)
    return balance
  },

  async sendToAddress({ wallet, toAddress, amount }) {
    const txHash = await usdc.sendTransaction({
      wallet,
      toAddress,
      amount,
      network
    })
    return txHash
  }
}
