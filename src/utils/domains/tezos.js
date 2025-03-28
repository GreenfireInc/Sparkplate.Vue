/*
 * Contributors: Aciel Ochoa
 *
 * Description: Methods for interacting with Tezos domains
 */

import Tezos from '../cryptos/blockchainApi/tezosInterface'
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client'
import { Tzip16Module } from '@taquito/tzip16'

// Create client
const tezos = Tezos.getInstance()
tezos.addExtension(new Tzip16Module())
const client = new TaquitoTezosDomainsClient({
  tezos,
  network: 'mainnet',
  caching: { enabled: true }
})

export default {
  async getAddress({ domain, coinTicker }) {
    // Throw Error for coins other than tezos
    if (coinTicker.toLowerCase() !== 'xtz')
      throw new Error(`${coinTicker} not supported for .tez domains`)

    // Resolve address
    const address = await client.resolver.resolveNameToAddress(domain)
    return address
  }
}
