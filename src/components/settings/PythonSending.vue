<!--
Contributors: Jyron Parker

Description: This component handles the left hand Remote Operations
  column under the Security tab in the Settings panel.
-->

<template>
  <form class="w-100" @submit.prevent>
    <p class="text-xl mb-3">Use Remote Operations</p>
    <p class="font-semibold">Method</p>
    <div class="d-flex">
      <p>Remote</p>
      <toggle-button
        tag="remoteSending"
        :value="userSettings.remoteSending"
        color="#3182ce"
        @change="toggle"
      />
    </div>
  </form>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PythonSending',
  data: () => ({}),
  computed: {
    ...mapState(['userSettings']),
    user() {
      return this.$store.state.accounts.active
    }
  },
  methods: {
    ...mapActions({
      toggleSetting: 'userSettings/toggleSetting',
      updateUser: 'accounts/updateUser'
    }),

    toggle(e) {
      const setting = e.tag
      this.toggleSetting(setting)
    }
  },
  async mounted() {}
}
</script>

<style scoped></style>
