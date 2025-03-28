<template>
  <div class="text-right">
    <h4 class="h4">Weight:</h4>
    <span>{{ weight }}</span>
  </div>
</template>

<script>
export default {
  name: 'MetricsComponent',
  props: {
    cryptos: {
      type: Array,
      required: true
    }
  },
  computed: {
    weight() {
      // Get total price and divide by count
      const count = this.cryptos.length
      const totalPrice = this.cryptos.reduce((total, crypto) => {
        total += crypto.quote[this.userCurrency].price
        return total
      }, 0)

      const weight = totalPrice / count
      return weight.toFixed(2)
    }
  }
}
</script>
