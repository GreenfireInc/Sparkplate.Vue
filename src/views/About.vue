<template>
  <modal
    name="about-modal"
    classes="p-3 view"
    width="70%"
    :styles="{ borderRadius: '1rem' }"
    height="auto"
    @closed="onClose"
    @opened="onOpen"
  >
    <h1 class="view-name">About</h1>

    <!-- Tab Selection -->
    <TabsWrapper>
      <TabComponent
        v-for="(name, mode) of modes"
        :key="mode + 'tab'"
        :active="mode === activeMode"
        :on-click="() => (activeMode = mode)"
        >{{ name }}
      </TabComponent>
    </TabsWrapper>

    <!-- Tab Content -->
    <div>
      <main-about v-if="activeMode === 'main'" />
      <notes v-if="activeMode === 'notes'" />
      <greenfire v-if="activeMode === 'greenfire'" />
    </div>
  </modal>
</template>

<script>
import MainAbout from '@/components/about/Main.vue'
import Notes from '@/components/about/Notes.vue'
import Greenfire from '@/components/about/Greenfire.vue'

export default {
  name: 'AboutView',
  components: { MainAbout, Notes, Greenfire },
  data: () => ({
    activeMode: 'main',
    modes: {
      main: 'Main',
      notes: 'Release Notes / Changelog',
      greenfire: 'Greenfire'
    },
    open: false
  }),
  watch: {
    activeMode(mode) {
      if (this.open) {
        this.$gtag.pageview({ page_title: `About - ${this.modes[mode]}` })
      }
    }
  },
  created() {
    window.ipcRenderer.on('about-modal-open', this.toggleModal)
  },
  methods: {
    onClose() {
      this.activeMode = 'main'
      this.open = false
    },
    onOpen() {
      this.open = true
      this.$gtag.pageview({ page_title: 'About - Main' })
    },
    toggleModal() {
      this.open
        ? this.$modal.hide('about-modal')
        : this.$modal.show('about-modal')
    }
  }
}
</script>
