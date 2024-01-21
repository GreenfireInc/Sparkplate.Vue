<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 16H6V20H3V16ZM9 10H12V20H9V10ZM15 4H18V20H15V4ZM21 8H24V20H21V8Z"
      fill="currentColor"
    />
  </svg>
</template>

<script>
export default {
  name: 'MarketIcon',
  props: {
    color: String,
    default: () => '#000'
  }
}
</script>
