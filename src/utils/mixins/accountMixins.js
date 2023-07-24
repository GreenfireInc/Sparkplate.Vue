/*
 * Contributors: Aciel Ochoa
 *
 * Description: This mixin file contains methods for various account
 *   methods used in different components in the Sparkplate application
 */

import { MultiFAService } from '@/service/MultiFAService'
import { mapState } from 'vuex'

export default {
  data: () => ({
    revealedPassword: '',
    mfaVerified: () => {},
    mfaCancelled: () => {}
  }),
  computed: {
    ...mapState({
      userSettings: (state) => state.userSettings
    }),
    mfaService() {
      // Since Signup/Login is currently disabled, a default user object will be used to render this page.
      const user = {}
      return new MultiFAService(user)
    }
  },
  methods: {
    validateAuthentication(types) {
      let typesArray = []
      // Accepts string or array of arguments
      const isString = typeof types === 'string'
      const isArray = Array.isArray(types)

      if (isString) typesArray.push(types)
      else if (isArray) typesArray = [...types]
      else {
        const message =
          'validateAuthentication expects either a string or array as the only parameter'
        throw new Error(message)
      }

      // Check if mfaSettings are enabled
      const { mfaEnabled } = this.userSettings
      const mfaTypeEnabled = typesArray.reduce((enabled, type) => {
        return enabled || this.userSettings[type]
      }, false)

      // Open modal and wait for user to complete authentication
      if (mfaEnabled && mfaTypeEnabled) {
        return this.initVerification()
      } else {
        return true
      }
    },
    initVerification() {
      return new Promise((resolve) => {
        const verified = () => {
          resolve(true)
        }
        const cancelled = () => {
          resolve(false)
        }

        this.$modal.show('verify', { verified, cancelled })
      })
    },
    mfaBeforeOpen(modalEvent) {
      const { verified, cancelled } = modalEvent.params
      this.mfaVerified = verified
      this.mfaCancelled = cancelled
    }
  }
}
