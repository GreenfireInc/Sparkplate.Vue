/*
 * Contributors: Aciel Ochoa
 *
 * Description: Methods for interacting eth Unstoppable Domain Services
 * Resolution Docs: https://github.com/unstoppabledomains/resolution
 */

import { walletList } from '@/config/walletListConfig'
import Resolution from '@unstoppabledomains/resolution'

const resolution = new Resolution()

export default {
  async getAddress({ domain, coinTicker }) {
    const crypto = walletList[coinTicker.toLowerCase()]
    if (crypto.coinType === 'token') {
      const address = await resolution.multiChainAddr(
        domain,
        coinTicker,
        'ERC20'
      )
      return address
    } else {
      const address = await resolution.addr(domain, coinTicker)
      return address
    }
  }
}
