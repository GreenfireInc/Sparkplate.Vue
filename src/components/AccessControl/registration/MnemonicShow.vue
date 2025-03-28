<template>
  <div>
    <div class="form-field">
      <label class="px-3 leading-6 py-2" v-if="!customInput">
        Write This Mnemonic Down Before Continuing. This will be neccessary for
        password recovery.
      </label>
      <label class="px-3 leading-6 py-2" v-else>
        Please Ensure You Correctly Enter Your Mnemonic Phrase Before
        Continuing. This will be neccessary for password recovery.
      </label>
      <div class="container" v-if="showWords">
        <div class="row">
          <div
            v-for="(forms, i) in phrase.filter((_, i) => i < 6)"
            :key="'word-' + (i + 1)"
            class="p-3 leading-7 col text-center"
          >
            <p>{{ forms }}</p>
            {{ i + 1 }}
          </div>
        </div>
        <div class="row">
          <div
            v-for="(forms, i) in phrase.filter((_, i) => i > 5)"
            :key="'word' + (i + 7)"
            class="p-3 leading-7 col text-center"
          >
            <p>{{ forms }}</p>
            {{ i + 7 }}
          </div>
        </div>
      </div>
      <div class="container" v-else>
        <div class="row">
          <div
            v-for="(_, i) in phrase.filter((_, i) => i < 6)"
            :key="'input-' + (i + 1)"
            class="leading-7 col text-center"
          >
            <input
              v-model="inputs[i]"
              class="border-b-2 w-20 border-gray-600 text-center"
              type="text"
            />
            <p>{{ i + 1 }}</p>
          </div>
        </div>
        <div class="row">
          <div
            v-for="(_, i) in phrase.filter((_, i) => i < 6)"
            :key="'input-' + (i + 7)"
            class="leading-7 col text-center"
          >
            <input
              v-model="inputs[i + 6]"
              class="border-b-2 w-20 border-gray-600 text-center"
              type="text"
            />
            <p>{{ i + 7 }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!showWords" class="my-6">
      <button
        class="bg-red-500 text-white px-4 py-2 mr-2"
        v-on:click="goBack"
        type="button"
      >
        Go Back
      </button>
      <button class="bg-blue-500 text-white px-4 py-2" @click="confirmMnemonic">
        Confirm Mnemonic
      </button>
    </div>
    <div v-else class="flex my-6 align-items-center">
      <button
        class="bg-blue-500 text-white px-4 py-2 mr-2"
        v-on:click="showWords = false"
      >
        Continue
      </button>
      <a
        @click.prevent="initCustomMnemonic"
        class="text-decoration-underline nav-link nav-item"
        >Use a Custom Mnemonic?</a
      >
      <button class="bg-white px-4 py-2 ml-2" @click.prevent="initPrint">
        Print
      </button>
      <print-mnemonic :form="form" @initPrint="getInitPrint" />
    </div>
  </div>
</template>

<script>
import PrintMnemonic from './PrintMnemonic.vue'

export default {
  props: ['form'],
  components: { PrintMnemonic },
  data() {
    return {
      showWords: true,
      customInput: false,
      phrase: [],
      inputs: [],
      initPrint: null
    }
  },
  methods: {
    goBack() {
      this.showWords = true
      this.customInput = false
    },
    initCustomMnemonic() {
      this.showWords = false
      this.customInput = true
    },
    confirmMnemonic() {
      if (this.customInput) {
        let count = 0
        this.inputs.forEach((word) => {
          if (word.length) count++
        })
        // NOTE: when testing can comment out this code so Sign Up process does not complete
        if (count === 12) {
          // this is where a succesful mnemonic is processed
          const customMnemonic = this.inputs.map((w) => w.trim()).join(' ')
          this.$emit('triggerSignup', customMnemonic)
        } else
          this.$toast.error(
            'Please fill in all 12 fields for mnemonic phrase.',
            'Invalid Phrase'
          )
      } else {
        this.verifyMnemonic()
      }
    },
    verifyMnemonic() {
      const words = this.phrase
      // console.log({ words, inputs: this.inputs })
      const failedWords = words.filter((word, i) => {
        return word !== this.inputs[i]
      })
      if (failedWords.length === 0) {
        this.$emit('triggerSignup')
      } else {
        this.$toast.error(
          'The mnemonic phrase you entered did not match!',
          'Invalid Phrase'
        )
      }
    },
    getInitPrint(method) {
      this.initPrint = method
    }
  },
  created() {
    this.phrase = this.form.mnemonic.phrase.trim().split(' ')
    if (import.meta.env.VITE_MNEMONIC)
      this.inputs = import.meta.env.VITE_MNEMONIC.split(' ')
  }
}
</script>
