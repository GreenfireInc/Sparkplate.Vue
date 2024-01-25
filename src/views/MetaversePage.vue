<template>
  <!-- This is the HTML section of MetaversePage.vue file -->
  <div class="view">
    <!-- Defining the heading content and its className -->
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
      websiteMeta: 'http://localhost:3400/decentraland'
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
