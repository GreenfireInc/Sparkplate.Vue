<template>
  <span>
    {{ currencySymbol && currencySymbol }}
    <img
      v-if="!currencySymbol"
      class="d-inline-block"
      :src="`./assets/cryptoicons/${symbol.toLowerCase()}.svg`"
      :alt="`${symbol}-symbol`"
      :width="size"
      :height="size"
    />
  </span>
</template>

<script>
import getSymbolFromCurrency from 'currency-symbol-map'

export default {
  name: 'CurrencySymbol',
  props: {
    symbol: {
      type: String,
      required: true,
      default: 'USD'
    },
    size: {
      type: Number,
      default: 20
    },
    forceIcon: {
      // When this property is true SVG icons will be used
      // Fiat currencies without an associated icon will not render
      type: Boolean,
      default: false
    }
  },
  computed: {
    currencySymbol() {
      if (this.forceIcon) return ''
      return getSymbolFromCurrency(this.symbol)
    }
  }
}
</script>
