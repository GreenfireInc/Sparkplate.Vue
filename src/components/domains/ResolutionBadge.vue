<!--
Contributors: Aciel Ochoa

Description: A badge used to display information about a resolved domain address.
-->

<template>
  <div>
    <div v-if="domainAddress.loading" class="spinner-border" role="status">
      <span class="invisible">Loading...</span>
    </div>
    <div v-else-if="domainAddress.address">
      <div class="d-flex justify-between">
        <span>Resolved:</span>
        <img
          class="domain-service-icon"
          :alt="`${domainAddress.service}-domains`"
          :src="`./assets/domainicons/${domainAddress.service}.svg`"
        />
      </div>
      {{ domainAddress.address }}
    </div>
    <div v-else>
      {{ domainAddress.error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'DomainResolutionBadge',
  props: {
    domainAddress: {
      type: Object,
      required: true
    },
    currency: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.domain-service-icon {
  width: auto;
  height: 1.8rem;
}
</style>
