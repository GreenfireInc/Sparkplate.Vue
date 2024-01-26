<template>
  <!-- This is the HTML section of PageTwo.vue file -->
  <div class="view">
    <!-- Defining the heading content and its className -->
    <h1 class="view-name">Examples</h1>
    <iframe
      :src="websiteTwo"
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
      websiteTwo: 'https://www.cryptocurrencychart.com/'
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
