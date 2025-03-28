<template>
  <div class="spinner" />
</template>

<script>
export default {
  name: 'LoadingSpinner'
}
</script>

<style lang="scss" scoped>
.spinner {
  @apply border-t-2 w-12 h-12 rounded-full animate-spin;
  margin: 1rem auto;
  border: 4px solid rgba($color: #000000, $alpha: 0.1);
  border-top-color: #38a169;
  border-top-width: 4px;
}
</style>
