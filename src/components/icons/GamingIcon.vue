<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="23"
    height="23"
  >
    <rect width="24" height="24" fill="#fff" />

    <path
      :fill="color"
      d="M0 0h8v8H0zM16 0h8v8h-8zM8 8h8v8H8zM0 16h8v8H0zM16 16h8v8h-8z"
    />
    />
  </svg>
</template>

<script>
export default {
  name: 'GamingIcon',
  props: {
    color: String,
    default: () => '#000'
  }
}
</script>
