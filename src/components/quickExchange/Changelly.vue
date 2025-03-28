<template>
  <div class="quick-exchange">
    <form
      v-if="allWallets.length > 0"
      id="quick-exchange-form"
      class="pt-6 px-8"
      @submit.prevent="submitForm"
    >
      <div class="grid grid-cols-2 gap-x-16">
        <!-- Exchange from -->
        <div>
          <h3 class="font-semibold leading-9">Exchange from</h3>
          <wallet-selection
            :wallets="allWallets"
            :handle-selection="selectSource"
            :filter="(wallet) => wallet.balance"
            placeholder="Select source"
          />

          <p class="text-sm my-1 quotas">
            <span @click="fillAmount(1)">All</span>
            |
            <span @click="fillAmount(0.5)">50%</span>
            |
            <span @click="fillAmount(0.25)">25%</span>
            |
            <span @click="fillAmount(0.1)">10%</span>
          </p>
          <div class="my-6 border border-gray-500 rounded mt-10.5">
            <p
              class="border-b border-gray-500 flex items-center justify-between p-2"
            >
              <input
                v-model="amountToSend"
                type="text"
                class="form-control text-lg font-semibold w-40"
                inputmode="numeric"
                pattern="(\d+(\.\d+)?)"
                required
                @change="handleAmountChange"
                @keypress="handleNumInput"
              />
              <span v-if="sourceWallet" class="uppercase">{{
                sourceWallet.currency
              }}</span>
            </p>
            <p class="p-2 flex items-center justify-between">
              <input
                v-model="fiatAmountToSend"
                type="text"
                class="form-control text-lg font-semibold w-40"
                inputmode="numeric"
                pattern="(\d+(\.\d+)?)"
                @change="handleFiatAmountChange"
                @keypress="handleNumInput"
              />
              <span>{{ userCurrency }}</span>
            </p>
          </div>
        </div>

        <!-- Receive -->
        <div>
          <h3 class="font-semibold leading-9">Receive</h3>
          <wallet-selection
            :wallets="destinationWalletList"
            :handle-selection="selectDestination"
            placeholder="Select destination"
          />

          <div class="my-6 border border-gray-500 rounded mt-12">
            <p
              class="border-b border-gray-500 flex items-center justify-between p-2"
            >
              <input
                class="form-control bg-transparent border-none text-lg font-semibold w-40"
                :value="formatNum(amountToReceive, 3)"
                disabled
              />
              <span v-if="destinationWallet" class="uppercase">{{
                destinationWallet.currency
              }}</span>
            </p>
            <p class="p-2 flex items-center justify-between">
              <input
                v-if="destinationWallet"
                class="form-control bg-transparent border-none text-lg font-semibold w-40"
                :value="
                  formatNum(
                    currencyToGlobalValue(
                      amountToReceive,
                      destinationWallet.currency
                    ),
                    3
                  )
                "
                disabled
              />
              <input
                v-else
                value="0"
                class="form-control bg-transparent border-none text-lg font-semibold w-40"
                disabled
              />
              <span>{{ userCurrency }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-2 mt-6 flex justify-center items-center flex-col">
        <spinner v-if="processing" />
        <template v-else>
          <div
            v-if="amountToReceive"
            class="bg-blue-200 p-4 rounded text-blue-700 flex items-center justify-between"
          >
            <div class="mr-6">
              <p class="text-gray-800">You are exchanging</p>
              <p class="text-2xl font-semibold">
                {{ amountToSend }} {{ sourceWallet.currency.toUpperCase() }}
              </p>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
              />
            </svg>

            <div class="ml-6 text-right">
              <p class="text-gray-800">You will receive an estimated</p>
              <p v-if="destinationWallet" class="text-2xl font-semibold">
                {{ amountToReceive }}
                {{ destinationWallet.currency.toUpperCase() }}
              </p>
            </div>
          </div>
          <button
            v-ripple="'rgba(255, 255, 255, .3)'"
            class="py-3 px-10 my-3 text-blue-800 font-medium rounded border-blue-500 border-2 hover:bg-blue-600 hover:text-white"
            type="submit"
            form="quick-exchange-form"
          >
            Exchange
          </button>
          <div class="mt-5 pt-5">
            <p v-if="sourceWallet" class="text-2xl font-semibold">
              1 {{ sourceWallet.currency.toUpperCase() }} =
              {{
                formatCurrencyWithSettings(
                  currencyToGlobalValue(1, sourceWallet.currency),
                  6
                )
              }}
            </p>
          </div>
        </template>
      </div>
      <div class="col-span-2 mt-6 flex justify-center items-center flex-col">
        <template v-if="showPayAddress">
          <div
            class="bg-red-200 p-4 rounded text-red-700 flex items-center justify-between"
          >
            <div class="mr-6">
              <p class="text-gray-800">
                There was an error automating your request! Please send a manual
                payment to {{ sourceWallet.currency.toUpperCase() }}
                {{ payinAddress }}
              </p>
              <p class="text-2xl font-semibold" />
            </div>
          </div>
        </template>
      </div>
    </form>
    <h1 v-else class="view-name">
      Please Generate At Least 2 Wallets To Use Quick Exchange
    </h1>
    <verify-modal
      :verified="mfaVerified"
      :cancelled="mfaCancelled"
      :before-open="mfaBeforeOpen"
    />
  </div>
</template>

<script>
import accountMixins from '@/utils/mixins/accountMixins'
import {
  getQuote,
  createTransaction,
  getExchangeRates
} from '@/factory/changelly'
import { mapState, mapGetters } from 'vuex'

// Components
import Spinner from '@/components/widgets/Spinner.vue'
import VerifyModal from '@/service/VerifyModal.vue'
import WalletSelection from '@/components/reusables/Form/WalletSelection.vue'

export default {
  name: 'QuickExchange',
  components: {
    Spinner,
    VerifyModal,
    WalletSelection
  },
  mixins: [accountMixins],
  data: () => ({
    amountToSend: 0,
    amountToReceive: 0,
    destinationWallet: null,
    fiatAmountToSend: 0,
    payinAddress: '',
    processing: false,
    showPayAddress: false,
    sourcePrice: 0,
    sourceWallet: null,
    transaction: null
  }),
  computed: {
    ...mapState(['coinsMeta', 'coinsInfo', 'wallets']),
    ...mapGetters(['allWallets']),
    destinationWalletList() {
      if (!this.sourceWallet) return this.allWallets
      return this.allWallets.filter(
        (wallet) => wallet.currency !== this.sourceWallet.currency
      )
    },
    fiatMaxAmount() {
      const wallet = this.sourceWallet
      if (!wallet) return 0

      const fiatValue = this.currencyToGlobalValue(
        wallet.balance,
        wallet.coinTicker
      )
      return fiatValue
    }
  },
  mounted() {},
  methods: {
    selectDestination(wallet) {
      this.destinationWallet = wallet
      this.getRates()
    },
    fillAmount(quota) {
      const amount = this.sourceWallet.balance * quota
      this.amountToSend = amount.toFixed(6)
      this.handleAmountChange()
    },
    selectSource(wallet) {
      this.sourceWallet = { ...wallet }
      this.getRates()
    },
    handleAmountChange() {
      const { amountToSend, sourceWallet } = this
      if (amountToSend > sourceWallet.balance)
        this.amountToSend = sourceWallet.balance
      const fiatAmount = this.currencyToGlobalValue(
        this.amountToSend,
        sourceWallet.coinTicker
      )
      this.fiatAmountToSend = fiatAmount.toFixed(6)
      this.getRates()
    },
    handleFiatAmountChange() {
      const fiatAmount = this.fiatAmountToSend
      const wallet = this.sourceWallet
      // get amount in crypto
      const cryptoValue = this.currencyToGlobalValue(1, wallet.coinTicker)
      const cryptoAmount = fiatAmount / cryptoValue
      // ensure wallet has proper balance
      if (wallet.balance < cryptoAmount) {
        this.amountToSend = wallet.balance
        this.fiatAmountToSend = this.fiatMaxAmount
        this.$toast.error('Not enough balance', '')
      }
      // set amountToSend in crypto value & getRates
      this.amountToSend = cryptoAmount.toFixed(6)
      this.getRates()
    },
    async getRates() {
      const { sourceWallet, destinationWallet, amountToSend } = this
      if (!sourceWallet || !destinationWallet || !amountToSend) {
        return this.$toast.warning(
          'Please ensure all fields have been properly filled.'
        )
      }

      try {
        const rates = await getExchangeRates(
          sourceWallet,
          destinationWallet,
          amountToSend
        )
        this.amountToReceive = rates[0].result
      } catch (err) {
        console.error(err)
        this.$toast.error(err.message, '')
        this.amountToReceive = 0
      }
    },
    async submitForm() {
      const { sourceWallet, destinationWallet, $toast } = this
      if (!sourceWallet) {
        return $toast.warning('Select source wallet', '', {
          possition: 'center',
          timeout: 1500
        })
      } else if (!this.destinationWallet) {
        return $toast.warning('Select destination wallet', '', {
          possition: 'center',
          timeout: 1500
        })
      }
      // Check for user authentication before attempting to send
      const authenticated = await this.validateAuthentication(
        'mfaRequireOnQuickExchange'
      )
      if (!authenticated) {
        return this.$toast.error('Unable to proceed with send request.', '')
      }

      this.$gtag.event('quick-exchange-changelly-transaction-attempt')
      try {
        this.processing = true

        // Validate amount
        const minAmount = await getQuote(sourceWallet, destinationWallet)
        if (this.amountToSend < minAmount) {
          $toast.error('You need to send at least ' + minAmount, '')
        }

        // Create transaction with Changelly and get payinAddress
        this.transaction = await createTransaction(
          sourceWallet,
          destinationWallet,
          this.amountToSend
        )
        this.payinAddress = this.transaction.payinAddress

        // Execute transaction
        const cryptoConfig =
          this.$walletListConfig.walletList[
            this.sourceWallet.currency.toLowerCase()
          ]
        const cryptoNetwork = cryptoConfig.mainnet
          ? cryptoConfig.mainnet
          : cryptoConfig.platform.network
        await window.cryptos.sendToAddress({
          wallet: sourceWallet,
          toAddress: this.payinAddress,
          amount: this.amountToSend,
          network: cryptoNetwork
        })

        this.$toast.success(
          'Average processing time is 15-20 minutes.',
          'Success!'
        )
      } catch (err) {
        this.showPayAddress = true
        console.error(err)
        $toast.error(err.message, '')
        this.$dialog.showErrorBox(
          'There was an error! Send manual payment to ' + this.payinAddress,
          'Error'
        )
      } finally {
        this.processing = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-exchange {
  .quotas {
    span {
      @apply cursor-pointer py-1 px-1 select-none;

      &:hover {
        @apply bg-white shadow;
      }
    }
  }

  .dropdown {
    @apply relative;

    .dropdown-menu {
      @apply absolute right-0 bg-white w-full shadow-lg rounded cursor-pointer p-1 hidden;
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
}
</style>
