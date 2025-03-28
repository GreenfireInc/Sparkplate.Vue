<!--
Contributors: Aciel Ochoa

Description: This component is imported into the settings view to handle
  rendering the Securtiy tab.
-->

<template>
  <div class="d-flex justify-content-between">
    <two-factor-auth />
    <misc-security />
  </div>
</template>

<script>
import TwoFactorAuth from './TwoFactorAuth.vue'
import MiscSecurity from './MiscSecurity.vue'

export default {
  name: 'SecuritySettings',
  components: {
    TwoFactorAuth,
    MiscSecurity
  }
}
</script>
