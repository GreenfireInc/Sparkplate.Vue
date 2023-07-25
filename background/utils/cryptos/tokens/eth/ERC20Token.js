import infura from '../../../blockchainApi/infura'
import standardConfig from './config/standardConfig'
import { Contract, utils } from 'ethers'

class ERC20Token {
  constructor(address, abi, implementation = null) {
    this.address = address
    this.abi = abi
    this.implementationOverride = implementation
  }

  /**
   * @param {Provider || Signer || String} providerOrNetwork an Instance of Infura Provider or Signer. Optionally takes a network string and created a new instance of InfuraProvider. default: homestead
   * @returns new Contract instance
   */
  async getContract(providerOrNetwork = 'homestead') {
    const { address, abi } = this
    let contract, provider

    if (typeof providerOrNetwork === 'string') {
      // If param is a String, we will create a provider with the specifice network name
      provider = infura.getProvider(providerOrNetwork)
      contract = new Contract(address, abi, provider)
    } else {
      // Else param is provider instance
      provider = providerOrNetwork
      contract = new Contract(address, abi, provider)
    }

    // Next we check if contract requires a proxy implementation
    if (contract.implementation) {
      const implementationAddress =
        this.implementationOverride || (await contract.implementation())
      contract = new Contract(
        implementationAddress,
        standardConfig.abi,
        provider
      )
      contract = contract.attach(address)
    }

    return contract
  }

  /**
   * @param {String} address to get balance of
   * @param {String} network to create contract instance on
   * @returns {String} balance of wallet address
   */
  async getBalance(address, network = 'homestead') {
    // Retrieve Balance
    const contract = await this.getContract(network)
    const balance = await contract.balanceOf(address)

    // Format and Return
    const erc20Decimals = await contract.decimals()
    const formattedBalance = utils.formatUnits(balance, erc20Decimals)
    return formattedBalance
  }

  /**
   * @param {Object} wallet where to send from
   * @param {String} toAddress where to send to
   * @param {String || Number} amount value to send
   * @param {String} network where to perform transaction
   * @returns
   */
  async sendTransaction({ wallet, toAddress, amount, network = 'homestead' }) {
    // Create a Signer(wallet) and Contract instance
    const signer = infura.getSigner({ privateKey: wallet.privateKey, network })
    const erc20 = await this.getContract(signer)
    // Get Token Decimals and parseUnits to create transaction
    const erc20Decimals = await erc20.decimals()
    const erc20Amount = utils.parseUnits(amount.toString(), erc20Decimals)
    const tx = await erc20.transfer(toAddress, erc20Amount)
    return tx.hash
  }
}

export default ERC20Token
