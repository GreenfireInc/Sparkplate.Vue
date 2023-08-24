<template>
  <div class="view">
    <h1 class="view-name">User Details</h1>
    <user-status />
  </div>
</template>

<script>
import UserStatus from '@/components/settings/UserStatus.vue'

export default {
  name: 'UserView',
  components: {
    UserStatus
  }
}
</script>
