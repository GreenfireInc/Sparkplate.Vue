<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 80 80"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Wi-Fi Bars -->
    <rect x="20" y="40" width="10" height="20" />
    <rect x="32" y="30" width="10" height="30" />
    <rect x="44" y="20" width="10" height="40" />
    <rect x="56" y="10" width="10" height="50" />
  </svg>
</template>

<script>
/*
 * By: Joshua Medvinsky
 *
 * Description: Created icon for the Network Awareness tab
 *
 */
export default {
  name: 'NetworkIcon',
  props: {
    color: String,
    default: () => ''
  }
}
</script>
