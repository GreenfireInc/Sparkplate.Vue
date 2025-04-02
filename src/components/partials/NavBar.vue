<template>
  <nav
    class="flex justify-between items-center bg-blue-600 text-white px-5 h-16 w-full shadow-md"
  >
    <div class="flex items-center">
      <div class="mr-5 cursor-pointer">
        <svg
          v-if="menuType === 'macro'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          class="hover:opacity-80 transition-opacity"
          @click="changeMenuType('micro')"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"
          />
        </svg>
        <svg
          v-if="menuType === 'micro'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          class="hover:opacity-80 transition-opacity"
          @click="handleMenuChange"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"
          />
        </svg>
      </div>
      <router-link
        to="/"
        class="brand-logo text-2xl font-semibold hover:opacity-80"
      >
        Sparkplate
      </router-link>
      <span v-if="isAuthenticated" class="ml-10 font-medium">
        Total Assets: {{ totalAssets }}
      </span>
    </div>
  </nav>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as SparkMD5 from 'spark-md5'

export default {
  name: 'NavBar',
  computed: {
    ...mapGetters({
      menuType: 'menuType',
      totalAssetsValue: 'wallets/totalAssetsValue'
    }),
    ...mapState({
      isAuthenticated: (state) => state.accounts.authenticated,
      activeAccount: (state) => state.accounts.active
    }),
    user() {
      return this.loggedUserData
    },
    gravatarLink() {
      let email = this.user?.email || 'sample@user.sparkplate' // replace this with a template user icon
      return `https://www.gravatar.com/avatar/${SparkMD5.hash(email)}?d=identicon`
    },
    totalAssets() {
      const total = this.totalAssetsValue
      return this.formatCurrencyWithSettings(total, 2)
    }
  },
  methods: {
    ...mapActions(['changeMenuType']),
    handleMenuChange() {
      if (this.activeAccount !== null) {
        this.changeMenuType('macro')
      }
    },
    logoutUser() {
      this.$store.dispatch('accounts/logout', this.user.id)
    }
  }
}
</script>

<style lang="scss">
/* Only keep styles that can't be handled by Tailwind */
.user-menu {
  .user-actions {
    top: 100%;
    width: max-content;
  }
}
</style>
