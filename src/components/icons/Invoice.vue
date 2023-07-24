<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="24"
    height="24"
  >
    <g id="Layer_17" data-name="Layer 17">
      <path
        :fill="color"
        d="m62 1h-60a1 1 0 0 0 -1 1v60a1 1 0 0 0 1 1h60a1 1 0 0 0 1-1v-60a1 1 0 0 0 -1-1zm-1 2v18h-58v-18zm-58 58v-38h58v38z"
      />
      <path :fill="color" d="m8 7h2v10h-2z" />
      <path :fill="color" d="m37 7h2v10h-2z" />
      <path
        :fill="color"
        d="m14 11.49 3.15 5a1 1 0 0 0 .85.51 1 1 0 0 0 .28 0 1 1 0 0 0 .72-1v-9h-2v5.51l-3.15-5a1 1 0 0 0 -1.13-.51 1 1 0 0 0 -.72 1v9h2z"
      />
      <path
        :fill="color"
        d="m23.17 16.55a1 1 0 0 0 1.66 0l2-3a1 1 0 0 0 .17-.55v-6h-2v5.7l-1 1.5-1-1.5v-5.7h-2v6a1 1 0 0 0 .17.55z"
      />
      <path
        :fill="color"
        d="m32 17a3 3 0 0 0 3-3v-4a3 3 0 0 0 -6 0v4a3 3 0 0 0 3 3zm-1-7a1 1 0 0 1 2 0v4a1 1 0 0 1 -2 0z"
      />
      <path
        :fill="color"
        d="m44 17h1a3 3 0 0 0 3-3h-2a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1h2a3 3 0 0 0 -3-3h-1a3 3 0 0 0 -3 3v4a3 3 0 0 0 3 3z"
      />
      <path
        :fill="color"
        d="m51 17h5v-2h-4v-2h4v-2h-4v-2h4v-2h-5a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1z"
      />
      <path
        :fill="color"
        d="m58 27h-52a1 1 0 0 0 -1 1v30a1 1 0 0 0 1 1h52a1 1 0 0 0 1-1v-30a1 1 0 0 0 -1-1zm-1 6h-24v-4h24zm-26-4v4h-24v-4zm-24 6h24v22h-24zm26 22v-22h24v22z"
      />
      <path
        :fill="color"
        d="m45 41a2 2 0 0 1 2 2h2a4 4 0 0 0 -3-3.86v-2.14h-2v2.14a4 4 0 0 0 1 7.86 2 2 0 1 1 -2 2h-2a4 4 0 0 0 3 3.86v2.14h2v-2.14a4 4 0 0 0 -1-7.86 2 2 0 0 1 0-4z"
      />
      <path :fill="color" d="m9 39h20v2h-20z" />
      <path :fill="color" d="m9 45h20v2h-20z" />
      <path :fill="color" d="m9 51h20v2h-20z" />
    </g>
  </svg>
</template>

<script>
export default {
  name: 'InvoiceIcon',
  props: {
    color: String,
    default: () => ''
  }
}
</script>
