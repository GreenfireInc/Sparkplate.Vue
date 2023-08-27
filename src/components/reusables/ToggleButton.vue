<template>
  <div>
    <label class="label">Switch to dark / light mode</label>
    <button
      class="toggle-button"
      :class="{ active: isActive }"
      @click="toggleDarkMode"
    >
      <span class="toggle-text">{{
        isActive ? activeText : inactiveText
      }}</span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    activeText: String,
    inactiveText: String,
    value: Boolean
  },
  computed: {
    isActive() {
      return this.value
    }
  },
  methods: {
    toggleDarkMode() {
      this.$store.commit('toggleDarkMode') // Emit an input event to update the parent's value
    }
  }
}
</script>

<style scoped>
.label {
  padding-right: 15px;
}
.dark-mode .label {
  color: black;
  padding-right: 15px;
}
.toggle-button {
  background-color: #ccc;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-button.active {
  background-color: #3182ce; /* Active color */
  color: white;
}

.toggle-text {
  margin-left: 5px;
}
</style>
