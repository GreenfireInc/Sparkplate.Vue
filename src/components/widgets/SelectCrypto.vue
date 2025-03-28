<template>
  <main class="relative">
    <div class="flex relative justify-end w-full">
      <div
        v-if="selectedCrypto != null"
        v-click-outside="close"
        class="border rounded-md max-w-sm w-full py-3 px-3 bg-white cursor-pointer"
        @click="fromWalletDropOpen = !fromWalletDropOpen"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <cryptoicon :symbol="selectedCrypto.symbol" size="35" />
            <div class="ml-2">
              <div class="content">
                <p class="main-info">
                  <span class="text-xs" v-text="selectedCrypto.name" />
                </p>
                <p class="text-xs font-medium">
                  1 {{ selectedCrypto.symbol }} | ${{
                    formatFigure(selectedCrypto.quote.USD.price)
                  }}
                  USD
                </p>
              </div>
            </div>
          </div>
          <div>
            <svg
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
              x="0px"
              y="0px"
              width="292.362px"
              height="292.362px"
              viewBox="0 0 292.362 292.362"
              style="enable-background: new 0 0 292.362 292.362"
              xml:space="preserve"
              class="w-3 h-3"
            >
              <g>
                <path
                  d="M286.935,69.377c-3.614-3.617-7.898-5.424-12.848-5.424H18.274c-4.952,0-9.233,1.807-12.85,5.424   C1.807,72.998,0,77.279,0,82.228c0,4.948,1.807,9.229,5.424,12.847l127.907,127.907c3.621,3.617,7.902,5.428,12.85,5.428   s9.233-1.811,12.847-5.428L286.935,95.074c3.613-3.617,5.427-7.898,5.427-12.847C292.362,77.279,290.548,72.998,286.935,69.377z"
                />
              </g>
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
            </svg>
          </div>
        </div>
      </div>
      <div
        v-if="fromWalletDropOpen"
        class="absolute top-0 mt-20 max-w-sm w-full shadow-md rounded-md h-56 overflow-y-auto"
      >
        <div
          v-for="crypto in coinsInfo"
          :key="crypto.id"
          class="bottom-0 bg-white shadow-xs px-4 py-2"
          @click="
            $emit('selected', crypto)
            fromWalletDropOpen = !fromWalletDropOpen
          "
        >
          <div class="flex items-center">
            <cryptoicon :symbol="crypto.symbol" size="35" />
            <div class="ml-3 pb-1 cursor-pointer">
              <span class="text-xs" v-text="crypto.symbol" />
              <span class="text-xs ml-2"> ( {{ crypto.name }} ) </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { mapState } from 'vuex'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'SelectCrypto',
  directives: {
    ClickOutside
  },
  props: ['selectedCrypto', 'tabindex'],
  data() {
    return {
      selected: null,
      fromWalletDropOpen: false
    }
  },
  mounted() {
    this.$emit('selected', this.coinsInfo[0])
  },
  methods: {
    close() {
      this.fromWalletDropOpen = false
    }
  },

  computed: {
    ...mapState({
      coinsInfo: 'coinsInfo'
    })
  }
}
</script>
