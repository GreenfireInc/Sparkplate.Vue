<template>
  <!-- This is the HTML section of GamingPage.vue file -->
  <div>
    <!-- Defining the heading content and its className -->
    <h1 class="GamingTitle">Decentraland Website</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'GamingPage',
      message: 'Gaming (Chess board) Website'
    }
  }
}
</script>

<style>
/* This is the CSS section of GamingPage.vue file  */
h1.GamingTitle {
  color: chocolate;
}
</style>
