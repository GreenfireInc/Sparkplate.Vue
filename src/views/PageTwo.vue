<template>
  <!-- This is the HTML section of PageTwo.vue file -->
  <div>
    <!-- Defining the heading content and its className -->
    <h1 class="Page2Title">Cryptocurrency examples</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'Page Two',
      message: 'Cryptocurrency examples'
    }
  }
}
</script>

<style>
/* This is the CSS section of PageTwo.vue file  */
h1.Page2Title {
  color: chocolate;
}
</style>
