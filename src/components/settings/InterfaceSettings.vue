<!-- This component is a page to toggle Dark mode for the entire application -->
<template>
  <div>
    <ToggleButton
      v-model="darkMode"
      activeText="Dark Mode"
      inactiveText="Light Mode"
    />
  </div>
</template>

<script>
import ToggleButton from '../../components/reusables/ToggleButton.vue'
export default {
  components: {
    ToggleButton
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode
    }
  },
  methods: {
    toggleDarkMode() {
      console.log('Toggling dark mode')
      this.$store.commit('toggleDarkMode')
    }
  }
}
</script>

<style scoped>
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
.dark-mode .toggle-label {
  /* background-color: black; */
  color: #000000;
}
</style>
