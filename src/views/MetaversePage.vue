<template>
  <!-- This is the HTML section of MetaversePage.vue file -->
  <div class="view">
    <!-- Defining the heading content and embedding decentraland website through iframe-->
    <h1 class="view-name">Metaverse Website</h1>
    <iframe
      :src="websiteMeta"
      width="100%"
      height="600"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'MetaversePage',
  data() {
    return {
      // In this section I use the local port to launch the decentraland website due to the restrictions of this website
      websiteMeta: 'http://localhost:3400/decentraland'
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
