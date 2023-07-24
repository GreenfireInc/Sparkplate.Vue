<!--
  Contributors: Jyrone Parker

  Description: Choose a currency from drop down list to sweep current wallet to.

-->

<template>
  <modal name="sweep-wallet" height="auto" classes="p-3">
    <h2 class="text-xl text-blue-800 font-medium">Sweep Wallet</h2>
    <form class="flex flex-col text-left" @submit.prevent="submit">
      <div class="input-field">
        <label for="recipient" class="mb-1">To</label>
        <select id="recipient" class="p-1" @change="handleChange">
          <option value="-1">Choose a Wallet</option>
          <option
            v-for="wallet in wallets"
            :key="wallet.address"
            :value="JSON.stringify(wallet)"
          >
            {{ wallet.address }}
          </option>
        </select>
      </div>
      <div class="d-flex flex-row-reverse">
        <button
          type="submit"
          class="btn bg-blue-700 text-white w-24 justify-center"
        >
          Sweep
        </button>
        <button
          type="button"
          class="btn bg-gray-300 w-24 justify-center"
          @click.prevent="handleClose"
        >
          Cancel
        </button>
      </div>
    </form>
  </modal>
</template>

<script>
export default {
  name: 'SweepWalletModal',
  props: {
    wallets: {
      type: Array,
      required: true
    },
    submit: {
      type: Function,
      required: true
    },
    selectedIndex: {
      type: Number,
      default: 0, // NOTE: refactor SweepWallet.vue default value must be set here or will execute as null
      required: true
    }
  },
  data() {
    return {
      visibleWallets: []
    }
  },
  methods: {
    handleChange(e) {
      const target = e.target.id
      const value = JSON.parse(e.target.value)
      this.$emit('handleChange', { target, value })
    },
    handleClose() {
      this.$modal.hide('sweep-wallet')
    }
  }
}
</script>
