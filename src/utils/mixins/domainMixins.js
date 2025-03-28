/*
 * Contributors: Aciel Ochoa
 *
 * Description: Domain resolution methods for usage in Vue components
 */
import domains from '../domains'

export default {
  methods: {
    isDomain(name) {
      const domainReg = /.+\..+/
      return domainReg.test(name)
    },
    async resolveAddressFromDomain({ domain, coinTicker }) {
      const address = await domains.resolveAddress({ domain, coinTicker })
      return address
    }
  }
}
