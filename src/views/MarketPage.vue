<template>
  <div class="view">
    <h1 class="view-name">Coin Market Cap website</h1>
    <iframe
      :src="proxyUrl"
      width="100%"
      height="600"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'PageTwo',
  data() {
    return {
      proxyUrl: 'http://localhost:3400/coinmarketcap'
    }
  }
}
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
}
</style>
