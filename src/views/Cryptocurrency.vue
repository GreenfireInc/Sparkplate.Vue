<template>
  <div class="view">
    <h1 class="view-name">Test</h1>
    <section class="mx-auto">
      <div class="mx-auto max-w-xl">
        <form class="mb-6" @submit.prevent="resolveAddress">
          <div class="input-group">
            <input
              v-model="domainAddress.domain"
              type="text"
              placeholder="Human Readable Domain Address"
              class="form-control"
              required
            />
            <input
              v-model="coinTicker"
              type="text"
              placeholder="Coin Ticker (e.g., BTC, ETH, XTZ)"
              class="form-control"
              required
            />
          </div>
          <button
            class="py-1 px-5 mt-4 rounded text-white hover:shadow"
            :class="{
              'bg-blue-600 hover:bg-blue-700': domainAddress.domain,
              'bg-blue-300': !domainAddress.domain
            }"
            type="submit"
          >
            Resolve Address
          </button>
        </form>
        <!-- Domain Address Resolution Display Info -->
        <domain-resolution-badge
          v-if="domainAddress.enabled"
          :domain-address="domainAddress"
          :currency="coinTicker"
        />
      </div>
    </section>
  </div>
</template>

<script>
import domainMixins from '@/utils/mixins/domainMixins'
import DomainResolutionBadge from '@/components/domains/ResolutionBadge.vue'

export default {
  name: 'HRTestPage',
  components: { DomainResolutionBadge },
  mixins: [domainMixins],
  data: () => ({
    coinTicker: '',
    domainAddress: {
      address: '',
      domain: '',
      enabled: false,
      loading: false,
      service: ''
    }
  }),
  methods: {
    async resolveAddress() {
      const { domain } = this.domainAddress
      const coinTicker = this.coinTicker

      // Check if provided domain name is valid
      const isDomain = this.isDomain(domain)
      if (!isDomain)
        return this.$toast.error('Not a valid domain address.', 'Error')

      // If domain is valid, ensure address,error, and service fields have been cleared
      this.domainAddress.address = ''
      this.domainAddress.service = ''
      this.domainAddress.error = ''

      // Resolve address from domain
      try {
        this.domainAddress.loading = true
        this.domainAddress.enabled = true
        const { address, service } = await this.resolveAddressFromDomain({
          domain,
          coinTicker
        })
        this.domainAddress.address = address
        this.domainAddress.service = service
      } catch (err) {
        this.domainAddress.error = err.message
      } finally {
        this.domainAddress.loading = false
      }
    }
  }
}
</script>
