<template>
  <nav
    class="flex justify-between w-full items-center text-white px-5 h-16 w-100"
    :class="[darkModeEnabled ? 'bg-gray-700' : 'bg-blue-600 ']"
    :style="headerStyles"
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
    <button
      v-tooltip="{
        content: toggleDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'
      }"
      class="tooltip-custom"
    >
      <toggle-button
        v-model="toggleDarkMode"
        :color="{ checked: 'rgb(30 41 59)', unchecked: 'rgb(148 163 184)' }"
        :switch-color="{
          checked: 'rgb(255 255 255)',
          unchecked: 'rgb(21 94 117)'
        }"
        :sync="true"
        :labels="false"
      />
    </button>
  </nav>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import * as SparkMD5 from 'spark-md5'
export default {
  name: 'NavBar',
  computed: {
    ...mapGetters({
      menuType: 'menuType',
      totalAssetsValue: 'wallets/totalAssetsValue',
      darkModeEnabled: 'userSettings/isDarkModeEnabled',
      getHeaderColor: 'userSettings/getHeaderColor'
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
    },
    /*
    Connected the store state for the dark mode toggle to the local component.
    */
    toggleDarkMode: {
      get() {
        return this.darkModeEnabled
      },
      set(value) {
        this.setDarkMode(value)
      }
    },
    /*
    I've established a binding between the local value for the header background color and the state within the store.
    */
    headerStyles() {
      return `background-color: ${this.getHeaderColor}`
    }
  },
  methods: {
    ...mapActions(['changeMenuType']),
    ...mapMutations('userSettings', ['setDarkMode']),
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
