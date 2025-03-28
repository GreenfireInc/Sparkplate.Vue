<template>
  <div class="view">
    <h1 class="view-name">Calculator</h1>
    <div class="main-content">
      <!-- left calculator field -->
      <form class="calc-section" @submit.prevent="convertBitToCurrency">
        <!-- currency toggle type -->
        <div class="d-flex flex-col">
          <span class="font-semibold leading-9">
            {{ !fromIsFiat ? 'Cryptocurrency' : 'Fiat' }}
          </span>
          <toggle-button v-model="fromIsFiat" color="#3182ce" />
        </div>

        <!-- amount & currency selection -->
        <div class="field-container">
          <div class="input-field">
            <label for="add-calculator-amount">Amount</label>
            <input
              id="add-calculator-amount"
              v-model="args.amount"
              class="mt-2 form-control"
              type="number"
              pattern="[0-9]*\.?[0-9]*"
              title="Positive numbers only"
              step="0.0000001"
              min="0"
              required
              @keypress="handleNumInput"
            />
          </div>
          <div class="input-field">
            <div class="currency-logo">
              <label for="add-contact-currency">Currency</label>
              <img
                v-if="!fromIsFiat && args.from.symbol"
                height="35"
                width="35"
                class="logo"
                :src="`./assets/cryptoicons/${args.from.symbol.toLowerCase()}.svg`"
              />
              <span v-else-if="fromIsFiat" class="h4 bold">{{
                getSymbolFromCurrency(args.from.symbol)
              }}</span>
            </div>
            <select
              v-if="fromIsFiat"
              id="add-contact-currency"
              v-model="args.from"
              class="heig form-control"
              :value="args.from"
              required
            >
              <option
                v-for="(item, index) in converts"
                :key="index"
                :value="item"
              >
                {{ item.name }}
              </option>
            </select>
            <select
              v-else
              id="add-contact-currencys"
              v-model="args.from"
              class="heig form-control"
              :value="args.from"
              required
            >
              <option
                v-for="(crypto, cryptoKey) in coinsMeta"
                :key="`contact-mutation-currency-${cryptoKey}`"
                :value="{ symbol: cryptoKey, name: crypto.name }"
                v-text="`${crypto.name} (${cryptoKey})`"
              />
            </select>
          </div>
        </div>

        <!-- actions group -->
        <div class="d-flex mt-5">
          <button v-ripple class="btn bg-blue-600 text-white">Convert</button>
          <button
            v-ripple
            class="btn bg-white"
            type="button"
            @click="initExport"
          >
            Export
          </button>
        </div>
      </form>
      <!-- left calculator field end -->

      <!-- convert center icon -->
      <div class="mx-3">
        <div class="bg-blue-600 inline-flex py-2 px-3 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            height="16px"
            width="16px"
            viewBox="0 0 24 24"
            class="text-white"
          >
            <path
              d="M6 16H20M20 16L17 19M20 16L17 13"
              stroke="currentColor"
              stroke-width="2"
              stroke-miterlimit="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18 8H4M4 8L7 11M4 8L7 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-miterlimit="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- right calculator field -->
      <div class="calc-section">
        <!-- currency toggle type -->
        <div class="d-flex flex-col">
          <span class="font-semibold leading-9">
            {{ !toIsCrypto ? 'Fiat' : 'Cryptocurrency' }}
          </span>
          <toggle-button v-model="toIsCrypto" color="#3182ce" />
        </div>

        <!-- amount & currency selection -->
        <div class="field-container">
          <div class="input-field">
            <label for="add-calculator-amount">Amount</label>
            <input
              id="add-calculator-amount"
              v-model="solution.amount"
              class="mt-2 form-control"
              type="text"
              placeholder="Not yet converted"
              readonly
            />
          </div>
          <div class="input-field">
            <div class="currency-logo">
              <label for="add-contact-currency">Currency</label>
              <img
                v-if="toIsCrypto && args.to.symbol"
                height="35"
                width="35"
                class="logo"
                :src="`./assets/cryptoicons/${args.to.symbol.toLowerCase()}.svg`"
              />
              <span v-else-if="!toIsCrypto" class="h4 bold mr-2">{{
                getSymbolFromCurrency(args.to.symbol)
              }}</span>
            </div>
            <select
              v-if="!toIsCrypto"
              id="add-contact-currency"
              v-model="args.to"
              class="heig form-control"
              :value="args.to"
              required
            >
              <option
                v-for="(item, index) in converts"
                :key="index"
                :value="item"
              >
                {{ item.name }}
              </option>
            </select>
            <select
              v-else
              id="add-contact-currencys"
              v-model="args.to"
              class="heig form-control"
              :value="args.to"
              required
            >
              <option
                v-for="(crypto, cryptoKey) in coinsMeta"
                :key="`contact-mutation-currency-${cryptoKey}`"
                :value="{ symbol: cryptoKey, name: crypto.name }"
                v-text="`${crypto.name} (${cryptoKey})`"
              />
            </select>
          </div>
        </div>

        <!-- NOT VISIBLE TO EVENLY FILL WHITE SPACE -->
        <button v-ripple class="btn bg-white mt-5 invisible">Convert</button>
      </div>
    </div>
    <calculator-export-canvas
      :args="args"
      :solution="solution"
      @initExport="getBeginExport"
    />
  </div>
</template>

<script>
// Components
import CalculatorExportCanvas from '@/components/calculator/CalculatorExportCanvas.vue'

// Utils
import { mapState, mapActions } from 'vuex'
import getSymbolFromCurrency from 'currency-symbol-map'
import BigNumber from 'bignumber.js'
import cc from 'currency-codes'

export default {
  name: 'CalculatorView',
  components: { CalculatorExportCanvas },
  data() {
    return {
      toIsCrypto: false,
      fromIsFiat: false,
      logoVisibility: false,
      solution: {
        amount: '',
        rate: ''
      },
      converts: [
        ...cc.data.map((c) => {
          return {
            name: `${c.currency} (${c.code})`,
            symbol: c.code
          }
        })
      ],
      args: {
        from: {
          // Left side currency selection
          symbol: 'BTC',
          name: 'Bitcoin'
        },
        to: {
          // right side currency selection
          symbol: 'USD',
          name: 'United States Dollar'
        },
        amount: 1
      },
      beginExport: null
    }
  },
  computed: {
    ...mapState(['coinsMeta'])
  },
  methods: {
    getSymbolFromCurrency,
    ...mapActions(['gainLossCalculator', 'fetchCoinsInfo']),
    async convertBitToCurrency() {
      const { amount, from, to } = this.args
      const res = await this.gainLossCalculator({
        amount: 1,
        symbol: from.symbol,
        convert: to.symbol
      })
      const rate = res[to.symbol].price.toFixed(8)
      this.solution.rate = new BigNumber(rate)
      this.solution.amount = this.solution.rate.times(amount) // get from client side calculation

      this.$gtag.event('calculator-conversion')
    },
    async initExport() {
      if (!this.solution.amount) await this.convertBitToCurrency()
      this.beginExport()
    },
    getBeginExport(method) {
      this.beginExport = method
    }
  },
  async mounted() {
    // fetch coin info for vuex state
    this.fetchCoinsInfo()
  }
}
</script>

<style lang="scss" scoped>
.main-content {
  @apply flex items-center justify-center;
  height: 80%;
  .calc-section {
    @apply border border-gray-500 rounded p-10;
    width: 40%;

    .field-container {
      @apply flex flex-col-reverse items-center mt-3 w-full;
    }
  }
}
.input-field {
  @apply w-full;
  min-height: 90px;
}
select {
  @apply w-full mt-1;
}
.currency-logo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
label {
  min-height: 35px;
}
</style>
