/*
 * Contributors: Aciel Ochoa
 *
 * Description: Module exports all directory contents along with methods
 *   used for dynamic interaction with all domain name services
 */
import ens from './ens'
import uns from './uns'
import tezos from './tezos'

function configExtensionServices() {
  // create an object with key value pairs pointing to each domain service
  const services = {
    eth: 'ens',
    tez: 'tezos'
  }
  const unstoppabledomains = [
    'x',
    'crypto',
    'coin',
    'wallet',
    'bitcoin',
    '888',
    'nft',
    'dao',
    'zil',
    'blockchain'
  ]
  unstoppabledomains.forEach((ext) => {
    services[ext] = 'uns'
  })

  return services
}

export default {
  ens,
  uns,
  tezos,
  services: configExtensionServices(),
  async resolveAddress({ domain, coinTicker, network }) {
    // Get domain extension to determine what resolution service to use
    const domainExtension = domain.split('.').slice(-1)
    let domainService = this.services[domainExtension]

    // if extenstion is not registered with a service, use ENS
    if (!domainService) domainService = 'ens'
    const address = await this[domainService].getAddress({
      domain,
      coinTicker,
      network
    })

    return { address, service: domainService }
  }
}
