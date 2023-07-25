<!--
Contributors: Aciel Ochoa

Description: This component handles the left hand Two Factor Authentication
  column under the Security tab in the Settings panel.
-->

<template>
  <div class="w-100">
    <p class="text-xl mb-3">Two Factor Authentication</p>
    <div class="max-w-2xl">
      <figure
        v-if="!userSettings.mfaEnabled"
        class="flex flex-column align-items-center mb-5"
      >
        <img id="google-auth-qr" :src="googleAuthQr" />
        <figcaption>
          Please, set up your authentication app before enabling 2FA.
        </figcaption>
      </figure>
      <div class="d-flex justify-content-between align-items-center">
        <label for="mfaEnabled" class="text-xl"
          >Enable two-factor authentication?</label
        >
        <toggle-button
          id="mfaEnabled"
          :value="userSettings.mfaEnabled"
          :sync="true"
          tag="mfaEnabled"
          color="#3182ce"
          @change="toggle2FA"
        />
      </div>
    </div>
    <verify-modal
      :verified="mfaVerified"
      :cancelled="mfaCancelled"
      :before-open="mfaBeforeOpen"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import accountMixins from '@/utils/mixins/accountMixins'

import VerifyModal from '@/service/VerifyModal.vue'

export default {
  name: 'TwoFactorAuth',
  components: { VerifyModal },
  mixins: [accountMixins],
  data: () => ({
    googleAuthQr: '',
    qrScanned: false
  }),
  computed: {
    user() {
      // Since Signup/Login is currently disabled, a default user object will be used to render this page.
      return {}
      // return this.$store.state.accounts.active
    }
  },
  methods: {
    ...mapActions({
      toggleSetting: 'userSettings/toggleSetting',
      updateUser: 'accounts/updateUser'
    }),
    toggle2FA(e) {
      if (e.value === false) {
        this.disable2FA(e)
      } else {
        this.verifyMFA(e)
      }
    },
    async disable2FA(e) {
      // verify user 2fa before toggling setting
      const authenticated = await this.initVerification()
      if (!authenticated)
        return this.$toast.error('You must verify 2FA before disabling.', '')
      this.$gtag.event('two-factor-auth-disabled')
      this.toggle(e)
      await this.generateSecret()
      this.generateQR()
    },
    async verifyMFA(e) {
      // verify user has set up 2fa before toggling setting
      const authenticated = await this.initVerification()
      if (!authenticated)
        return this.$toast.error(
          'Please ensure you have set up 2FA on you app before enabling.',
          ''
        )
      this.$gtag.event('two-factor-auth-enabled')
      this.toggle(e)
    },
    async generateQR() {
      // check if user has a google authenticator secret
      // if not give the user a secret and update the user
      if (
        !this.user.googleAuthenticatorCode ||
        this.user.googleAuthenticatorCode === null
      ) {
        await this.generateSecret()
      }
      this.googleAuthQr = await this.mfaService.generateQr()
    },
    async generateSecret() {
      this.user.googleAuthenticatorCode = await this.mfaService.generateSecret()
      // Since Signup/Login is currently disabled, this.updateUser will be skipped.
      return
      // this.updateUser(this.user)
    },
    toggle(e) {
      const setting = e.tag || e.target.id
      this.toggleSetting(setting)
    }
  },
  async beforeMount() {
    this.generateQR()
  }
}
</script>

<style scoped>
#google-auth-qr {
  height: 300px;
  width: 300px;
}
</style>
