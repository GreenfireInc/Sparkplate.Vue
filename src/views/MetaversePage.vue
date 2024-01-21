<template>
  <!-- This is the HTML section of MetaversePage.vue file -->
  <div>
    <!-- Defining the heading content and its className -->
    <h1 class="DecentralandTitle">Decentraland Website</h1>
    <div class="DecentralandWeb">
      <iframe width="100%" :src="frame1.url"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'MetaversePage',
      message: 'Decentraland Website',
      frame1: {
        url: 'https://decentraland.org/auth/login?redirectTo=https%3A%2F%2Fdecentraland.org%2Fplay%2F%3FskipSetup%3Dtrue'
      }
    }
  }
}
</script>

<style>
/* This is the CSS section of Market.vue file  */
h1.DecentralandTitle {
  color: chocolate;
}
</style>
