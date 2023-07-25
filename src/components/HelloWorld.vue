<template>
  <div>
    <h1 class="h1 font-bold my-4">{{ msg }}</h1>

    <div class="p-4">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit:
        <code>components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <p class="my-3">
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
        >create-vue</a
      >, the official Vue + Vite starter
    </p>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: ['msg'],
  setup() {
    const count = ref(0)

    return {
      count
    }
  }
}
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
