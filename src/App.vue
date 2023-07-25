<!--
Contributors: Aciel Ochoa

Description: App.vue is the main parent component of the entire client side application
-->

<template>
  <div id="app">
    <nav-bar />
    <div class="main-content-wrapper nav-active">
      <side-nav />
      <main
        style="min-width: 90%"
        class="flex-grow bg-gray-100 relative h-full"
      >
        <router-view class="flex-grow h-full" />
      </main>
    </div>

    <!-- timeout popup -->
    <div
      v-if="accounts.authenticated && !userActive"
      class="z-20 w-full h-full absolute top-0 left-0 fade-bg"
    >
      <div
        class="py-10 px-12 bg-white shadow hover:shadow-xl opacity-100 max-w-xl mx-auto mt-20 text-center"
      >
        <p class="text-2xl text-blue-900 font-medium mb-6">
          Are you still there?
        </p>
        <div class="flex justify-center items-center">
          <button
            class="btn border-blue-700 text-blue-800 border-2 w-32 justify-center"
            @click="stopCountdown"
          >
            Yes
          </button>
          <button
            class="btn w-32 bg-blue-600 border-blue-700 border-2 text-white justify-center items-start"
            @click="logout"
          >
            Logout
          </button>
        </div>
        <p class="flex text-xl justify-center items-center mt-5 text-red-800">
          <span>00</span>
          <span class="mx-1">:</span>
          <span v-text="twoDigits(secs)" />
        </p>
      </div>
    </div>
    <!-- timeout popup -->

    <dapp-call-request v-if="accounts.authenticated" />
    <!-- help modal -->
    <keyboard-shortcuts />
    <about />
  </div>
</template>

<script>
// Components
import NavBar from '@/components/partials/NavBar.vue'
import SideNav from '@/components/partials/SideNav.vue'
import DappCallRequest from '@/components/web3Connect/DappCallRequest.vue'
import KeyboardShortcuts from './components/help/KeyboardShortcuts.vue'
import About from './views/About.vue'

// Mixins
import toastMixins from './utils/mixins/toastMixins'
import backupMixins from './utils/mixins/backupMixins'

// Utilities
import { initJsStore } from './service/IdbService'

export default {
  name: 'SparkplateApp',
  components: {
    About,
    NavBar,
    SideNav,
    DappCallRequest,
    KeyboardShortcuts
  },
  mixins: [toastMixins, backupMixins],
  data: () => ({
    fetchBalanceIntervals: 35 * 1000,
    fetchCoinsInfoIntervals: 1000 * 60 * 5,
    isInactive: false,
    userActivityThrottlerTimeout: null,
    userActivityTimeout: null,
    countdownInterval: null,
    fetchBalancesInterval: null,
    throttleTime: 1000,
    inactivityTime: 1000 * 10,
    userActive: true,
    secs: 0,
    helpModalOpen: false
  }),
  computed: {
    user() {
      const activeUser = this.$store.state.accounts.active
      return JSON.parse(JSON.stringify(activeUser))
    }
  },
  watch: {
    // Initialize Wallet Connect after user has logged in
    'accounts.authenticated': function (authenticated) {
      if (authenticated) {
        const dispatch = this.$store.dispatch

        // Initialize WalletConnect and WalletBeacon
        dispatch('web3Connections/walletBeaconInit', {
          modal: this.$modal,
          gtag: this.$gtag
        })
        dispatch('web3Connections/walletConnectInit', {
          modal: this.$modal,
          gtag: this.$gtag
        })
      }
    }
  },
  async mounted() {
    try {
      this.activateActivityTracker()
      this.startCountdowm()
      await initJsStore()
    } catch (err) {
      console.error(err)
    }
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.userActivityThrottler)
    window.removeEventListener('scroll', this.userActivityThrottler)
    window.removeEventListener('keydown', this.userActivityThrottler)
    window.removeEventListener('resize', this.userActivityThrottler)

    clearTimeout(this.userActivityTimeout)
    clearTimeout(this.userActivityThrottlerTimeout)
  },
  methods: {
    activateActivityTracker() {
      window.addEventListener('mousemove', this.resetUserActivityTimeout)
      window.addEventListener('scroll', this.resetUserActivityTimeout)
      window.addEventListener('keyup', this.resetUserActivityTimeout)
      window.addEventListener('resize', this.resetUserActivityTimeout)
    },
    resetUserActivityTimeout() {
      var timeoutValue =
        1000 * parseInt(this.$store.state.userSettings.toggleTimeoutValue)
      clearTimeout(this.userActivityTimeout)
      // NOTE inactivityTime was removed from setTimeout below, see if store value for timeout works
      this.userActivityTimeout = setTimeout(() => {
        this.inactiveUserAction()
      }, timeoutValue)
    },
    userActivityThrottler() {
      if (!this.userActivityThrottlerTimeout) {
        this.userActivityThrottlerTimeout = setTimeout(() => {
          this.resetUserActivityTimeout()

          clearTimeout(this.userActivityThrottlerTimeout)
          this.userActivityThrottlerTimeout = null
        }, this.throttleTime)
      }
    },
    inactiveUserAction() {
      if (!this.userActive) return
      clearTimeout(this.userActivityTimeout)
      clearTimeout(this.userActivityThrottlerTimeout)
      this.userActive = false
      this.secs = 30
      this.startCountdowm()
    },
    startCountdowm() {
      // if (!this.secs) this.secs = 30
      this.countdownInterval = setInterval(() => {
        if (this.secs) this.secs -= 1
        if (!this.secs) {
          clearInterval(this.countdownInterval)
          this.logout()
        }
      }, 1000)
    },
    stopCountdown() {
      clearInterval(this.countdownInterval)
      this.secs = 30
      this.userActive = true
    },
    logout() {
      if (this.user) {
        this.stopCountdown()
        // make dispatch call to log out user
        this.$store.dispatch('accounts/logout', this.user.id)
      }
    },
    twoDigits(num) {
      num = String(num)
      return num.length === 1 ? `0${num}` : num
    },
    fetchBalances() {
      this.fetchBalancesInterval = setInterval(() => {
        // Only allow method to run if user has loggedIn and been authenticated
        if (!this.loggedIn && this.accounts.authenticated) return
        this.$store.dispatch('wallets/getBalances')
      }, this.fetchBalanceIntervals)
    }
  }
}
</script>

<style>
.vld-shown {
  overflow: hidden;
}

.vld-overlay {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  align-items: center;
  display: none;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
}

.vld-overlay.is-active {
  display: flex;
}

.vld-overlay.is-full-page {
  z-index: 9999;
  position: fixed;
}

.vld-overlay .vld-background {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  background: #fff;
  opacity: 0.5;
}

.vld-overlay .vld-icon,
.vld-parent {
  position: relative;
}
</style>
<style lang="scss">
#app {
  @apply h-screen overflow-y-hidden;

  .widget-container {
    @apply fixed z-10;
  }

  .view {
    @apply h-full py-2 px-3 overflow-y-auto;

    .view-name {
      @apply text-2xl mb-4 font-semibold;
    }
  }

  .main-content-wrapper {
    @apply h-full flex;

    &.nav-active {
      height: calc(100% - 4rem);
    }
  }

  button,
  input,
  textarea,
  select {
    &:focus {
      @apply outline-none;
    }
  }

  .btn {
    @apply py-2 px-5 flex font-medium items-center mr-3;

    &:hover {
      @apply shadow-md;
    }

    &:focus {
      @apply shadow-lg;
    }

    .icon {
      @apply ml-3 h-5;
    }
  }

  .th {
    @apply font-semibold;
  }

  .datatable {
    .cell {
      @apply py-2 font-normal;

      &.th {
        @apply font-semibold;
      }
    }
  }

  .fade-bg {
    background-color: rgba(0, 0, 0, 0.2);
  }
  video.camera {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
    border-radius: 0.5rem !important;
  }
}
</style>
