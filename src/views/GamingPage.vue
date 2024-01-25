<template>
  <!-- Your Vue component content here -->
  <div class="view">
    <!-- Defining the heading content and its className -->
    <h1 class="view-name">Chess Board Website</h1>
    <div ref="chessboardContainer"></div>
  </div>
</template>

<script>
export default {
  name: 'GamingPage',
  mounted() {
    // Use the chessboardContainer reference
    console.log(this.$refs.chessboardContainer)
  }
}
</script>

<style scoped>
/* Add your custom styles here */
#chessboard-container {
  width: 400px;
  /* Add more styles as needed */
}
</style>
