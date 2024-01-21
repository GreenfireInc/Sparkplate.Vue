<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M40 3.33334C20.5403 3.33334 5.33337 18.5403 5.33337 38C5.33337 57.4597 20.5403 72.6667 40 72.6667C59.4597 72.6667 74.6667 57.4597 74.6667 38C74.6667 18.5403 59.4597 3.33334 40 3.33334ZM40 70C21.1653 70 5.33337 54.168 5.33337 38C5.33337 21.832 21.1653 6 40 6C58.8346 6 74.6667 21.832 74.6667 38C74.6667 54.168 58.8346 70 40 70Z"
      :fill="color"
    />
  </svg>
</template>

<script>
export default {
  name: 'PageOneIcon',
  props: {
    color: String,
    default: () => '#000'
  }
}
</script>
