<!--
Contributors: Jyrone Parker, Aciel Ochoa

Description: This component was created to handle two factor authentication
  using the package otplib. This component can be used with the validateAuthentication
  and mfaBeforeOpen methods inside src/utils/mixins/accountMixins.js, or on its
  own with proper functions passed as props

Example:
  <verify-modal :beforeOpen="mfaBeforeOpen" :verified="mfaVerified" :cancelled="mfaCancelled"/>
  ...
  import accountMixins from '@/utils/mixins/accountMixins.js'
  export default {
    mixins: [accountMixins],
    methods: {
      async doSecureAction() {
        const authenticated = await this.validateAuthentication('mfaRequreOnLogin')
      }
    }
  }

Props:
  verified - FUNCTION called upon successfully  verifying authentication
  cancelled - FUNCTION called when user click cancel button and modal closes
  beforeOpen - FUNCTION passed to the emitted @before-open event on the modal
    MORE INFO: https://euvl.github.io/vue-js-modal/Events.html

-->
<template>
  <modal
    name="verify"
    :click-to-close="false"
    classes="flex justify-center align-items-center"
    @before-open="beforeOpen"
    @opened="focusInput"
  >
    <form class="flex flex-column align-items-center" @submit.prevent="verify">
      <p>Please Input Your 2FA Code Here</p>
      <div class="input-group my-5">
        <input
          v-for="(field, i) in fields"
          :id="`verification_field_${i}`"
          :key="`verification_field_${i}`"
          class="input-field w-10 text-xl text-center"
          placeholder="-"
          :value="fields[i]"
          :aria-label="`verification_field_${i + 1}`"
          :data-index="i"
          type="text"
          @keydown="handleKeydown"
        />
      </div>
      <div class="flex space-around">
        <button
          type="submit"
          class="btn bg-blue-700 text-white w-24 justify-center"
          @click.prevent="verify"
        >
          Verify
        </button>
        <button
          type="button"
          class="btn bg-red-700 text-white w-24 justify-center"
          @click.prevent="cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  </modal>
</template>
<script>
import accountMixins from '@/utils/mixins/accountMixins'

export default {
  name: 'VerifyModal',
  mixins: [accountMixins],
  props: {
    verified: {
      type: Function,
      required: true
    },
    cancelled: {
      type: Function,
      required: true,
      default: () => {}
    },
    beforeOpen: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  data: () => ({
    fields: Array(6).fill('')
  }),
  computed: {
    code() {
      return this.fields.join('')
    }
  },
  methods: {
    async verify() {
      const isValid = await this.mfaService.verifyToken(this.code)
      if (isValid) {
        this.$toast.success('Successfully verified!')
        this.$modal.hide('verify')
        this.verified()

        // Reset fields
        this.resetForm()
      } else {
        this.$toast.error('Incorrect code!', '')
      }
    },
    cancel() {
      this.cancelled()
      this.$modal.hide('verify')
      this.resetForm()
    },
    focusInput() {
      const input = document.getElementById('verification_field_0')
      input.focus()
    },
    handleKeydown(e) {
      e.preventDefault()
      if (e.key === 'Enter') {
        return this.verify()
      }
      const index = e.target.dataset.index
      const isBackspace = e.key === 'Backspace'
      const isNumberKey = /^\d+$/
      const currFields = [...this.fields]
      if (isNumberKey.test(e.key) || isBackspace) {
        if (!isBackspace) {
          currFields[index] = e.key
          this.fields = [...currFields]
          if (index < 5) {
            const nextInput = document.getElementById(
              `verification_field_${parseInt(index) + 1}`
            )
            nextInput.focus()
          }
        } else if (isBackspace) {
          if (index > 0 && !currFields[index]) {
            const previousInput = document.getElementById(
              `verification_field_${parseInt(index) - 1}`
            )
            previousInput.focus()
          }
          currFields[index] = ''
          this.fields = [...currFields]
        }
      }
    },
    resetForm() {
      this.fields = Array(6).fill('')
    }
  }
}
</script>
