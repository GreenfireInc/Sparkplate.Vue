<template>
  <form @submit.prevent="auth" class="registration-form" ref="authForm">
    <welcome-text />
    <div>
      <p
        v-if="actionStatus.text"
        class="text-xl rounded bg-blue-200 p-3 mt-8 mb-2"
      >
        {{ actionStatus.text }}
      </p>
      <div
        v-if="!verify"
        class="inline-flex items-center border-b mb-4 mt-4 text-xl font-semibold"
      >
        <div
          v-for="(mode, modeIndex) in modes"
          :key="`auth-access-mode_${modeIndex}`"
          v-ripple
          :class="{
            'border-b-2': mode === activeMode || activeMode === 'Next'
          }"
          class="py-3 px-4 border-blue-500 cursor-pointer"
          v-text="mode"
          @click="setActiveMode(mode)"
        />
      </div>
      <div
        @click="goBack"
        v-ripple
        class="capitalize border-b-2 mb-4 mt-4 text-xl font-semibold inline-block border-blue-500"
        v-else
      >
        <!-- Title Section -->
        <div class="py-3 flex items-center px-4 cursor-pointer">
          <svg
            class="w-6 h-6 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 447.24 447.24"
          >
            <path
              d="M420.36 192.23c-1.83-.3-3.68-.43-5.53-.41H99.3l6.88-3.2a64 64 0 0018.08-12.8l88.48-88.48a33.12 33.12 0 004.64-42.4 32 32 0 00-48-4.16l-160 160a32 32 0 00-.03 45.25l.03.03 160 160a32 32 0 0048-3.2 33.12 33.12 0 00-4.64-42.4l-88.32-88.64a64 64 0 00-16-11.68l-9.6-4.32h314.24a33.12 33.12 0 0033.76-26.88 32 32 0 00-26.47-36.71z"
            />
          </svg>
          <!-- title text is a variable for setting based on activeMode -->
          <span>{{ this.titleText }}</span>
        </div>
      </div>
      <div v-if="!verify">
        <div class="form-field" v-if="activeMode !== 'Login'">
          <label>firstname</label>
          <input type="text" v-model="form.firstname" required />
        </div>
        <div class="form-field" v-if="activeMode !== 'Login'">
          <label>lastname</label>
          <input type="text" v-model="form.lastname" />
        </div>
        <div class="form-field">
          <label>email</label>
          <input type="email" v-model="form.email" required />
        </div>
        <div class="form-field">
          <label>Password</label>
          <input type="password" v-model="form.password" required />
        </div>
        <div class="form-field" v-if="activeMode !== 'Login'">
          <label>Confirm Password</label>
          <input type="password" v-model="form.cpassword" required />
        </div>
      </div>
      <!-- adding EULA -->
      <eula-display
        v-else-if="activeMode === 'EULA'"
        @displayMnemonicNext="displayMnemonicNext"
      />
      <!-- mnemonic is the default case -->
      <mnemonic-show v-else :form="form" @triggerSignup="triggerSignup" />
    </div>

    <button
      v-if="!verify"
      type="submit"
      v-text="activeMode"
      v-ripple="'rgba(255, 255, 255, .15)'"
      class="py-4 px-4 text-center bg-blue-500 w-full text-white"
    />
    <verify-modal
      :verified="() => $store.dispatch('accounts/setAuthenticated', true)"
      :cancelled="() => $store.dispatch('accounts/logout')"
    />
  </form>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import WelcomeText from './WelcomeText.vue'
import MnemonicShow from './MnemonicShow.vue'
import EulaDisplay from './EulaDisplay.vue'
import bugReporter from '../../logging/BugReporter'
import accountMixins from '@/utils/mixins/accountMixins'
import VerifyModal from '@/service/VerifyModal.vue'
import mailChimpMixins from '@/utils/mixins/mailChimpMixins'

export default {
  components: { WelcomeText, EulaDisplay, MnemonicShow, VerifyModal },
  mixins: [accountMixins, mailChimpMixins],
  data() {
    return {
      modes: ['Sign up', 'Login'],
      activeMode: '',
      previousMode: '',
      verify: false,
      titleText: 'Verify',
      displayEULA: false,
      inputs: [],
      form: {
        firstname: import.meta.env.VITE_FIRSTNAME || '',
        lastname: import.meta.env.VITE_LASTNAME || '',
        email: import.meta.env.VITE_EMAIL || '',
        password: import.meta.env.VITE_PASSWORD || '',
        cpassword: import.meta.env.VITE_PASSWORD || '',
        mnemonic: '',
        mailChimpSignUp: false
      }
    }
  },
  computed: {
    actionStatus() {
      return this.$store.state.accounts.status
    },
    ...mapState(['wallets', 'coinsMeta', 'coinsInfo']),
    walletsInView() {
      const wallets = this.wallets[this.activeCrypto]
      if (!wallets || !wallets.length) return []
      return wallets.filter((wallet) => wallet.address || wallet.accountId)
    }
  },
  methods: {
    ...mapActions({
      login: 'accounts/login',
      signup: 'accounts/signup'
    }),
    setActiveMode(mode) {
      if (mode === 'EULA') {
        this.titleText = 'EULA'
      } else {
        this.titleText = 'Verify'
      }
      this.previousMode = this.activeMode
      this.activeMode = mode
    },
    triggerLogin() {
      return this.login({ form: this.form, requireMFA: this.openMFAModal })
    },
    async triggerSignup(customMnemonic) {
      const form = { ...this.form }
      if (customMnemonic) {
        const mnemonic = await window.cryptos.generateMnemonic(customMnemonic)
        form.mnemonic = mnemonic
        form.generateWallets = true
      }
      this.setLoader(() => this.signup(form))
      // make sure user has checked Mail Chimp checkbox
      if (this.form.mailChimpSignUp) {
        this.mailChimpAddMember(this.form)
      }
    },
    goBack() {
      // adding special case for EULA, user will go back to Sign Up from Menumonic screen
      // so activeMode needs to be set to Sign up so that EULA does not appear as text inside Submit button
      if (this.previousMode === 'EULA') {
        this.setActiveMode('Sign up')
      } else {
        this.setActiveMode(this.previousMode)
      }
      this.verify = false
    },
    displayMnemonicNext() {
      this.setActiveMode('Next')
      this.verify = true
    },
    auth() {
      if (this.activeMode === 'Login') {
        this.setLoader(this.triggerLogin)
      } else if (this.activeMode === 'Sign up') {
        // setting mail_chimp_sign_up to false here if user is signing up again
        localStorage.setItem('mail_chimp_sign_up', false)
        if (this.form.password !== this.form.cpassword) {
          this.$toast.error('Passwords do not match.', 'Try again')
          return
        }
        // Mnemonic component is the default else in template code
        // adding new mode for displaying EULA, after EULA is done mode will be set to Next
        this.setActiveMode('EULA')
        this.verify = true
      }
    },
    setLoader(callback) {
      // Set loader handles loading/waiting for signup or login action to be completed
      const loader = this.$loader(null, { zIndex: 9999, opacity: 0.3 })
      this.$nextTick(async () => {
        try {
          await callback()
          // on successful signup/login store lasted used email
          const email = this.form.email
          localStorage.setItem('lastUsedEmail', email)
        } catch (err) {
          console.error(err)
          bugReporter.catchError(err)
        } finally {
          loader.hide()
        }
      })
    },
    openMFAModal() {
      this.$modal.show('verify')
    }
  },
  beforeMount() {
    window.cryptos
      .generateMnemonic()
      .then((mnemonic) => {
        const { phrase, seed } = mnemonic
        this.form.mnemonic = { phrase, seed }

        // load stored email if set
        const email = localStorage.getItem('lastUsedEmail')
        if (email) this.form.email = email
      })
      .catch((err) => {
        console.error(err)
      })
  },
  mounted() {
    this.setActiveMode('Login')
    if (this.$route.name !== 'Home') this.$router.replace('/')
  }
}
</script>
<style lang="scss" scoped>
.registration-form {
  @apply bg-white rounded-lg p-6 max-w-3xl mx-auto text-blue-900 shadow overflow-auto w-3/4;
  max-height: 90%;

  &:hover {
    @apply shadow-xl;
  }
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    @apply bg-blue-600 rounded-lg;
  }
  &::-webkit-scrollbar-track {
    @apply bg-gray-200 rounded-lg;
  }
}
.form-field {
  @apply bg-gray-200 px-1 py-1 mb-3 rounded flex flex-col;

  label {
    @apply text-xs font-semibold px-1 capitalize -mb-1;
  }

  input {
    @apply py-2 px-1 bg-transparent;

    &:focus {
      @apply outline-none;
    }
  }
}

.mb-8 {
  margin-bottom: 10rem;
}

svg {
  vertical-align: super;
  display: flex;
}
</style>
