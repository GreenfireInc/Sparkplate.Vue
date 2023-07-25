<template>
  <aside
    :class="menuType"
    class="flex flex-col items-stretch bg-white shadow-md border-r border-gray-300"
  >
    <router-link v-ripple to="/directories">
      <span class="icon">
        <files-icon :color="pathColor('directories')" />
      </span>
      <span class="link-text">Settings</span>
    </router-link>
    <router-link v-ripple to="/test">
      <span class="icon">
        <wallet-icon :color="pathColor('test')" />
      </span>
      <span class="link-text">Settings</span>
    </router-link>
    <router-link v-ripple to="/settings/user">
      <span class="icon">
        <settings-icon :color="pathColor('settings')" />
      </span>
      <span class="link-text">Settings</span>
    </router-link>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'

import FilesIcon from '../icons/Files.vue'
import SettingsIcon from '../icons/Settings.vue'
import WalletIcon from '../icons/Wallet.vue'

export default {
  name: 'SideNav',
  components: {
    FilesIcon,
    SettingsIcon,
    WalletIcon
  },
  computed: {
    ...mapGetters(['menuType'])
  },
  data: () => ({
    path: ''
  }),
  watch: {
    $route(to) {
      this.path = to.path
    }
  },
  mounted() {
    this.path = this.$route.path
  },
  methods: {
    pathColor(path) {
      const actualPath = this.path.split('/')[1]
      return actualPath === `${path}`
        ? 'rgba(49, 130, 206, var(--bg-opacity))'
        : 'black'
    }
  }
}
</script>

<style lang="scss" scoped>
.micro,
.macro {
  height: calc(100vh - 4rem);

  a {
    @apply flex items-center py-3 px-5 font-medium;

    &:hover {
      @apply bg-gray-100;
    }

    &.router-link-exact-active {
      @apply relative text-blue-700 font-semibold;

      &:before {
        content: '';
        @apply absolute left-0 top-0 bg-blue-700 h-full rounded-full;
        width: 2px;
      }
    }
  }
}
.macro {
  .icon {
    @apply mr-3;
  }
  .link-text {
    @apply pr-2;
    width: max-content;
  }
}
.micro {
  a {
    .link-text {
      @apply hidden;
    }
  }
}
</style>
