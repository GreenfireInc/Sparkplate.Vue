import BlockchainInterface from './BlockchainInterface'
import { providers, utils, Wallet } from 'ethers'
import config from '../../../config/walletListConfig'
const infuraProjectID = import.meta.env.VITE_INFURA_PROJECT_ID

const testnets = {}
config.walletList.eth.testnets.forEach((net) => {
  testnets[net] = net
})

class InfuraEthereum extends BlockchainInterface {
  constructor() {
    super('Infura', {
      homestead: 'homestead',
      ...testnets
    })
    this.projectId = infuraProjectID
  }

  /**
   * @param {String} network name of ETH network to connect to. default: 'homestead'
   * @returns InfuraProvider instance
   */
  getProvider(network = 'homestead') {
    this.setNetwork(network)
    return new providers.InfuraProvider(this.network, this.projectId)
  }

  /**
   * @param {String} address wallet to get balance for
   * @returns {String} of balance in ETH
   */
  async getBalance({ address, network }) {
    const provider = this.getProvider(network)
    const balance = await provider.getBalance(address)
    return utils.formatEther(balance)
  }

  /**
   * @param {String} privateKey Wallet privateKey to create Signer instance
   * @param {String} network to use as provider
   * @returns {Wallet} instance of Signer
   */
  getSigner({ privateKey, network = 'homestead' }) {
    const provider = this.getProvider(network)
    const signer = new Wallet(privateKey, provider)
    return signer
  }
}

export default new InfuraEthereum()
