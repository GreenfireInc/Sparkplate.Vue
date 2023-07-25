<template>
  <nav
    class="flex justify-between items-center bg-blue-600 text-white px-5 h-16 w-100"
  >
    <div class="flex items-center">
      <div class="mr-5">
        <svg
          v-if="menuType === 'macro'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          @click="changeMenuType('micro')"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="white" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
        </svg>
        <svg
          v-if="menuType === 'micro'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          @click="
            $store.state.accounts.active !== null
              ? changeMenuType('macro')
              : false
          "
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="white" d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
        </svg>
      </div>
      <router-link to="/" class="brand-logo text-2xl font-semibold">
        Sparkplate
      </router-link>
      <span v-if="accounts.authenticated" class="ml-10"
        >Total Assets: {{ totalAssets }}</span
      >
    </div>
  </nav>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as SparkMD5 from 'spark-md5'
export default {
  name: 'NavBar',
  computed: {
    ...mapGetters({
      menuType: 'menuType',
      totalAssetsValue: 'wallets/totalAssetsValue'
    }),
    user() {
      return this.loggedUserData
    },
    gravatarLink() {
      let email
      if (!this.user) email = 'sample@user.sparkplate' // replace this with a template user icon
      email = this.user.email
      return `https://www.gravatar.com/avatar/${SparkMD5.hash(
        email
      )}?d=identicon`
    },
    totalAssets() {
      const total = this.totalAssetsValue
      return this.formatCurrencyWithSettings(total, 2)
    }
  },
  methods: {
    ...mapActions(['changeMenuType']),
    logoutUser() {
      this.$store.dispatch('accounts/logout', this.user.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-menu {
  @apply flex items-center relative cursor-pointer;

  .user-actions {
    @apply bg-white shadow p-1 rounded absolute right-0 font-extrabold flex-col z-10 mt-0 hidden;
    top: 100%;
    width: max-content;

    & > span {
      @apply bg-gray-100 text-gray-700 px-3 py-1 block;
    }
  }

  &:hover {
    .user-actions {
      @apply flex;
    }
  }
}
</style>
