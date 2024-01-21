<template>
  <!-- This is the HTML section of PageOne.vue file -->
  <div>
    <!-- Defining the heading content and its className -->
    <h1 class="Page1Title">Cryptocurrency definition</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'Page One',
      message: 'Cryptocurrency definition'
    }
  }
}
</script>

<style>
/* This is the CSS section of PageOne.vue file  */
h1.Page1Title {
  color: chocolate;
}
</style>
