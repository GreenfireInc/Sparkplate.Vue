<template>
  <div
    class="dropdown border h-24 border-blue-600 p-2 rounded flex items-center"
  >
    <template v-if="selectionMade">
      <img
        v-if="selectedWallet"
        class="h-10"
        :src="`./assets/cryptoicons/${selectedWallet.coinTicker.toLowerCase()}.svg`"
        :alt="selectedWallet.coinTicker"
      />
      <div v-if="selectedWallet != null" class="px-3">
        <h3 class="text-xl font-semibold">
          {{ coinsMeta[selectedWallet.coinTicker.toUpperCase()].name }}
        </h3>
        <p
          class="text-xs break-all"
          v-text="
            selectedWallet.address
              ? tickerWithAddress(selectedWallet)
              : selectedWallet.accountId
          "
        />
        <p class="text-gray-600">
          {{ formatNum(selectedWallet.balance, 6) }}
          {{ selectedWallet.coinTicker.toUpperCase() }} |
          {{
            formatCurrencyWithSettings(
              currencyToGlobalValue(
                selectedWallet.balance,
                selectedWallet.coinTicker
              ),
              3
            )
          }}
        </p>
      </div>
    </template>
    <p v-else class="text-lg px-2">
      {{ placeholder }}
    </p>

    <div class="flex flex-grow justify-end">
      <svg
        class="fill-current text-blue-700"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"
        />
      </svg>
    </div>

    <div
      v-if="availableWallets.length"
      class="dropdown-menu max-w-6xl overflow-y-auto"
    >
      <div
        v-for="(wallet, walletIndex) in availableWallets"
        :key="`${wallet.coinTicker}-${wallet.address || wallet.accountId}`"
        v-ripple="'rgba(0, 0, 0, .1)'"
        class="menu-item flex items-center"
        @click="selectWallet(wallet, walletIndex)"
      >
        <!-- @click="selectSource(walletIndex)" -->
        <img
          class="h-8 mr-2"
          :src="`./assets/cryptoicons/${wallet.coinTicker.toLowerCase()}.svg`"
          :alt="wallet.coinTicker"
        />
        <div class="text-xs">
          <div>
            <span
              class="mr-2 break-all"
              v-text="
                wallet.address ? tickerWithAddress(wallet) : wallet.accountId
              "
            />
          </div>
          <span class="text-gray-600">
            {{ formatNum(wallet.balance, 6) }}
            {{ wallet.coinTicker.toUpperCase() }} |
            {{
              formatCurrencyWithSettings(
                currencyToGlobalValue(wallet.balance, wallet.coinTicker),
                3
              )
            }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="dropdown-menu">No wallets available</div>
  </div>
</template>

<script>
import walletMixins from '@/utils/mixins/walletMixins'

export default {
  name: 'WalletSelection',
  mixins: [walletMixins],
  props: {
    wallets: {
      type: Array,
      required: true
    },
    handleSelection: {
      type: Function,
      required: true
    },
    placeholder: {
      type: String,
      require: true
    },
    filter: {
      type: Function,
      default: () => {
        return true
      }
    }
  },
  data: () => ({
    selectedWallet: null,
    selectionMade: false
  }),
  computed: {
    availableWallets() {
      return this.wallets.filter(this.filter)
    },
    coinsMeta() {
      return this.$store.state.coinsMeta
    }
  },
  methods: {
    selectWallet(wallet) {
      this.selectionMade = true
      this.selectedWallet = { ...wallet }
      this.handleSelection(wallet)
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  @apply relative;
  max-width: 28rem;

  .dropdown-menu {
    @apply absolute right-0 bg-white w-full shadow-lg rounded cursor-pointer p-1 hidden;
    max-height: 50vh;
    top: 100%;

    .menu-item {
      @apply py-1 px-2 z-10 rounded;

      &:hover {
        @apply bg-gray-100;
      }
    }
  }

  &:hover .dropdown-menu {
    @apply flex flex-col;
  }
}
</style>
