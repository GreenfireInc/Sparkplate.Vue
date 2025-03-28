class BlockchainInterface {
  /**
   * @param {String} name Name to identify blockchain interface instance as.
   * @param {Object} networks Object with network key value pairs to assist with API configuration. { homestead: 'https://mainnet.infura.io', ropsten: 'https://ropsten.infura.io' }
   */
  constructor(name, networks) {
    if (!name || !networks)
      throw new Error('Expected two parameters. name: string, networks: object')
    this.network = ''
    this.interfaceName = name
    this.networks = networks
  }

  /**
   * @param {String} network Network to configure interface with.
   */
  setNetwork(network) {
    if (!this.networks[network]) {
      throw new Error(
        `Network ${network} is not a valid network for ${
          this.interfaceName
        }. Valid networks: ${Object.keys(this.networks)}`
      )
    }

    this.network = this.networks[network]
  }
}

export default BlockchainInterface
