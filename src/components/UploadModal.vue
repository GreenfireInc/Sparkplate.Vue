<template>
  <div class="modal-wrapper">
    <div class="modal">
      <span class="close" @click="closeUploadModal">&times;</span>
      <slot></slot>
    </div>
    <div class="overlay" @click="closeUploadModal"></div>
  </div>
</template>

<script>
export default {
  methods: {
    closeUploadModal() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  position: relative;
  z-index: 1001;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  cursor: pointer;
  font-size: 24px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  padding: 20px;
}

/* Add more specific styles for your file input */
input[type='file'] {
  margin: 10px 0;
}
</style>
