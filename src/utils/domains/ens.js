/*
 * Contributors: Aciel Ochoa
 *
 * Description: Methods for interacting with ENS services
 * ENSJS Docs: https://github.com/ensdomains/ensjs)
 */
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import { providers } from 'ethers'

export default {
  getEnsInstance(network = 'homestead') {
    const provider = providers.InfuraProvider.getWebSocketProvider(network)
    const ens = new ENS({ provider, ensAddress: getEnsAddress('1') })
    return ens
  },
  getName({ domain, network }) {
    const ens = this.getEnsInstance(network)
    const name = ens.name(domain)
    return name
  },
  async getAddress({ domain, coinTicker, network }) {
    const name = this.getName({ domain, network })
    const address = await name.getAddress(coinTicker.toUpperCase())
    if (address === '0x0000000000000000000000000000000000000000')
      throw new Error(`No ${coinTicker} address found for ${domain}`)
    return address
  }
}
