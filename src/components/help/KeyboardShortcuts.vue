<template>
  <modal
    name="keyboard-shortcuts-modal"
    classes="p-1 help-modal"
    :styles="{ borderRadius: '1rem' }"
    height="auto"
    @closed="onClose"
  >
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Function</th>
          <th scope="col">Keyboard Shortcut</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(shortcut, i) in shortcuts"
          :key="`shortcut-${shortcut.action}`"
        >
          <th>{{ i + 1 }}</th>
          <td>{{ shortcut.action }}</td>
          <td>{{ shortcut.key }}</td>
        </tr>
      </tbody>
    </table>
  </modal>
</template>

<script>
// Utilities
const isMac = window.app.platform === 'darwin'

// Shortcuts table array
const shortcut = (key, action) => ({ key, action })
const metaKeyIdentifier = isMac ? '⌘' : 'Ctrl'
const shortcuts = [
  shortcut(`${metaKeyIdentifier} + Tab`, 'Go to Next Page'),
  shortcut(`${metaKeyIdentifier} + Shift + ~`, 'Go to Home'),
  shortcut(`${metaKeyIdentifier} + Shift + S`, 'Go to Settings'),
  shortcut(`${metaKeyIdentifier} + Shift + ←`, 'Go Back')
]

// pageMap will direct the route to the next tab based on current route
const pageMap = {
  home: '/settings/user', // from "home" we will go to "/settings/user"
  settings: '/'
}

export default {
  name: 'KeyboardShortcuts',
  data: () => ({
    keyboardShortcutsOpen: false,
    shortcuts
  }),
  watch: {
    keyboardShortcutsOpen() {
      this.keyboardShortcutsOpen
        ? this.$modal.show('keyboard-shortcuts-modal')
        : this.$modal.hide('keyboard-shortcuts-modal')
    }
  },
  created() {
    document.addEventListener('keyup', this.keyBoardShortcut)
    window.ipcRenderer.on('keyboard-shortcuts-modal-open', () => {
      this.toggleModal()
    })
  },
  methods: {
    keyBoardShortcut(evt) {
      const metaKey = isMac ? evt.metaKey : evt.ctrlKey
      const isAuthenticated = this.accounts.authenticated

      if (metaKey && evt.keyCode === 9) {
        // Ctrl+Tab
        this.nextPage()
        evt.preventDefault()
      } else if (metaKey && evt.shiftKey && evt.keyCode) {
        evt.preventDefault()
        switch (evt.keyCode) {
          case 192: // Ctrl+Shift+~
            this.goToHome()
            break
          case 83: // Ctrl+Shift+S
            this.goToSettings()
            break
          case 76: // Ctrl+Shift+L
            this.logout(isAuthenticated)
            break
          case 37: // Ctrl+Shift+LeftArrow
            this.goBack()
            break
          case 191:
            this.toggleModal()
            break
        }
      }
    },
    goToHome() {
      const path = '/'
      if (this.$route.path !== path) this.$router.push(path)
    },
    goToSettings() {
      const path = '/settings/user'
      if (this.$route.path !== path) this.$router.push(path)
    },
    nextPage() {
      const currentPage = this.$route.name.toLowerCase()
      const nextPageRoute = pageMap[currentPage]
      if (!nextPageRoute) return // exit if next route not found
      this.$router.push(nextPageRoute)
    },
    toggleModal() {
      this.keyboardShortcutsOpen = !this.keyboardShortcutsOpen
    },
    logout(isAuthenticated) {
      if (isAuthenticated) this.$store.dispatch('accounts/logout')
    },
    goBack() {
      this.$router.go(-1)
    },
    onClose() {
      this.keyboardShortcutsOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
.help-modal {
  border-radius: 15rem;
}
</style>
