import infura from './blockchainApi/infura'
import { utils, FixedNumber } from 'ethers'

export default {
  getChainId(network) {
    const chain = {
      homestead: 1,
      goerli: 5,
      sepolia: 11155111
    }

    return chain[network]
  },
  async getNonce({ address, network }) {
    const provider = infura.getProvider(network)
    const nonce = await provider.getTransactionCount(address, 'latest')
    return nonce
  },

  async txFee({ from, to, gasPrice, value, network }) {
    const tx = {
      from,
      to,
      value: utils.parseUnits(value.toString(), 'ether')
    }

    try {
      const provider = infura.getProvider(network)
      const gasLimit = await provider.estimateGas(tx)

      // prevent numeric underflow with decimal values using FixedNumber
      const fixedGasPrice = FixedNumber.from(gasPrice.toString())
      const fee = gasLimit.mul(fixedGasPrice)
      return { gasLimit, fee }
    } catch (err) {
      console.error({ err })
      return { err }
    }
  }
}
