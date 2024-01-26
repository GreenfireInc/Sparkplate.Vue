<template>
  <!-- This section is the main structure of the Coin Market Cap Website -->
  <div class="view">
    <!-- This div section contains the first heading and embeds the website though a server file -->
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
      // In this section I use the local port to launch the coinmarketcap website due to the restrictions of this website
      proxyUrl: 'http://localhost:3400/coinmarketcap'
    }
  }
}
</script>

<style scoped>
/* In this section I set the dimensions of how the website will be displayed inside of MarketPage */
iframe {
  width: 100%;
  height: 100%;
}
</style>
