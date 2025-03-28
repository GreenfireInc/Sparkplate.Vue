<template>
  <div class="modal-container align-items-center">
    <p class="text-xl text-center mb-4">
      Your Secret 12 Word Recovery Phrase Is Hidden For Security. Mouseover The
      Numbers To Reveal.
    </p>
    <div class="row">
      <div
        v-for="(_, i) in phrase.filter((_, i) => i < 6)"
        :key="'input-' + (i + 1)"
        class="leading-7 col text-center flex flex-column-reverse"
      >
        <p class="number-selector">
          {{ i + 1 }}
        </p>
        <input
          v-model="phrase[i]"
          class="word-selector border-b-2 w-20 border-gray-600 text-center"
          type="text"
          disabled
        />
      </div>
    </div>
    <div class="row">
      <div
        v-for="(_, i) in phrase.filter((_, i) => i < 6)"
        :key="'input-' + (i + 7)"
        class="leading-7 col text-center flex flex-column-reverse"
      >
        <p class="number-selector">
          {{ i + 7 }}
        </p>
        <input
          v-model="phrase[i + 6]"
          class="word-selector border-b-2 w-20 border-gray-600 text-center"
          type="text"
          disabled
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MnemonicModal',
  data: () => ({
    phrase: []
  }),
  beforeMount() {
    this.phrase = this.loggedUserData.mnemonic.split(' ')
  }
}
</script>

<style lang="scss" scoped>
.modal-container {
  @apply flex flex-col justify-center;
  height: 100%;
}
.number-selector {
  cursor: pointer;
}
.word-selector {
  color: rgba(0, 0, 0, 0);
  background: transparent;
}
.number-selector:hover + .word-selector {
  color: rgba(0, 0, 0, 1);
}
</style>
