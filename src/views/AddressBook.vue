<!--
Contributors: Jonathan Allison, Aciel Ochoa

Description: This component handles the everything in regards to
  the addressbook panel
-->
<template>
  <qrcode-drop-zone @detect="onFileDrag" @dragover="onDragOver">
    <div class="drop-area h-full" :class="{ dragover: dragover }">
      <div class="view address-book" @click="closeModals">
        <h1 class="view-name">Address Book</h1>

        <!-- adddress controls -->
        <div class="flex items-center">
          <button
            v-ripple="'rgba(255, 255, 255, .2)'"
            class="btn text-white bg-blue-600"
            @click.stop="openAddContact"
          >
            Add contact
            <add-icon class="icon" color="white" />
          </button>
          <div class="dropdown">
            <button
              id="importContactButton"
              v-ripple="'rgba(255, 255, 255, 0.35)'"
              class="btn rounded bg-white"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click="toggleImportContactMenu"
            >
              Import Contact
              <import-icon class="icon" />
            </button>
            <ul
              class="dropdown-menu"
              :class="importContactMenuOpen && 'show'"
              aria-labelledby="importContactButton"
            >
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click="importContactsFromCSV"
                >
                  Import from CSV
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="importContactFromQR">
                  Contact QR Scanner
                </a>
              </li>
            </ul>
          </div>
          <button
            v-ripple
            class="btn bg-white"
            @click="
              $store.dispatch('contacts/exportContacts', (fileName) => {
                $gtag.event('addressbook-export')
                $toast.success(`Exported contacts to ${fileName}`)
              })
            "
          >
            Export to CSV
            <export-icon class="icon" />
          </button>
          <!-- Jonathan Allison -->
          <!-- Tabs Container -->
          <div class="tabs-container">
            <TabsWrapper class="tab-container">
              <TabComponent
                :on-click="() => (activeTab = '1')"
                :active="activeTab === '1'"
              >
                <strong>Contacts</strong>
              </TabComponent>
              <TabComponent
                :on-click="() => (activeTab = '2')"
                :active="activeTab === '2'"
              >
                <strong>Exchanges</strong>
              </TabComponent>
              <TabComponent
                :on-click="() => (activeTab = '3')"
                :active="activeTab === '3'"
              >
                <strong>Wallets</strong>
              </TabComponent>
            </TabsWrapper>
          </div>
        </div>
        <!-- adddress controls -->

        <!-- Contacts Tab -->
        <contacts-tab
          v-if="activeTab === '1'"
          :init-edit-contact="initEditContact"
          :init-add-currency="initAddCurrency"
          :download-qr-code="downloadQrCode"
        />
        <!-- Exchanges Tab -->
        <exchanges-tab
          v-if="activeTab === '2'"
          :init-edit-contact="initEditContact"
          :init-add-currency="initAddCurrency"
          :download-qr-code="downloadQrCode"
        />
        <!-- Wallets Tab -->
        <wallets-tab
          v-if="activeTab === '3'"
          :init-edit-contact="initEditContact"
          :init-add-currency="initAddCurrency"
          :download-qr-code="downloadQrCode"
        />

        <div @click.stop>
          <!-- Add Currency side-pop -->
          <side-pop
            id="address-mutation"
            :active="currencyMutationModalOpen"
            :title="currencyMutation"
          >
            <currency-mutation-form
              :currencies-form="currenciesForm"
              :currency-mutation="currencyMutation"
              :contact-id="selectedContactId"
              :close-currency-mutation-modal="closeCurrencyMutationModal"
            />
          </side-pop>

          <!-- Add/Edit Contact sidepop -->
          <side-pop
            id="address-mutation"
            :active="mutationModalOpen"
            :title="mutation"
          >
            <contact-mutation-form
              :form="form"
              :mutation="mutation"
              :init-add-currency="initAddCurrency"
              :init-edit-currencies="initEditCurrencies"
              :close-mutation-modal="closeMutationModal"
            />
          </side-pop>

          <!-- Contact QR Scanner Modal -->
          <modal name="qr-camera-modal" height="auto" classes="p-2">
            <div
              class="bg-white flex flex-col items-center justify-center p-10"
            >
              <div style="width: 50px">
                <qr-code-icon style="fill: #38a169" class="icon" />
              </div>
              <p class="text-xl my-2">
                Please scan a contact QR code to import
              </p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <qrcode-stream
                v-if="qrCameraModalOpen"
                class="qr-code rounded-lg"
                style="border-radius: 0.5rem !important"
                @init="onQrInit"
                @decode="onQrDecode"
              >
                <div v-if="qrLoading" class="loading-indicator text-center">
                  Loading...
                </div>
              </qrcode-stream>
            </div>
            <div class="flex items-center justify-center pt-10">
              <button
                v-ripple="'rgba(255, 255, 255, .2)'"
                class="btn text-white bg-red-600"
                @click.stop="qrCameraModalOpen = !qrCameraModalOpen"
              >
                Cancel
              </button>
            </div>
          </modal>
        </div>
      </div>
    </div>
  </qrcode-drop-zone>
</template>

<script>
// Components
import AddIcon from '@/components/icons/Add.vue'
import ImportIcon from '@/components/icons/Download.vue'
import ExportIcon from '@/components/icons/Export.vue'
import QrCodeIcon from '@/components/icons/QrCode.vue'
import SidePop from '@/components/widgets/SidePop.vue'
import ContactsTab from '@/components/addressBook/ContactsTab.vue'
import ExchangesTab from '@/components/addressBook/ExchangesTab.vue'
import WalletsTab from '@/components/addressBook/WalletsTab.vue'
import ContactMutationForm from '@/components/addressBook/ContactMutationForm.vue'
import CurrencyMutationForm from '@/components/addressBook/CurrencyMutationForm.vue'

// Mixins
import walletMixins from '@/utils/mixins/walletMixins'

// Utils
import { mapState } from 'vuex'
import QRCode from 'qrcode'

const _currenciesForm = () => ({
  coinTicker: '',
  address: '',
  confirmAddress: ''
})

const initState = () => ({
  activeTab: '1',
  importContactMenuOpen: false,
  qrCameraModalOpen: false,
  qrLoading: true,
  dragover: false,
  mutationModalOpen: false,
  currencyMutationModalOpen: false,
  qrScanner: null,
  mutation: '',
  currencyMutation: '',
  form: {
    type: 'regular',
    firstname: '',
    lastname: '',
    company: '',
    email: '',
    domain: '',
    notes: '',
    exchangeName: '',
    referralCode: '',
    walletName: ''
  },
  currenciesForm: [_currenciesForm()],
  selectedContactId: 0
})

export default {
  name: 'AddressBook',
  components: {
    AddIcon,
    ImportIcon,
    ExportIcon,
    QrCodeIcon,
    ContactsTab,
    ExchangesTab,
    WalletsTab,
    SidePop,
    ContactMutationForm,
    CurrencyMutationForm
  },
  mixins: [walletMixins],
  computed: {
    ...mapState({
      user: (state) => state.accounts.active
    })
  },
  data: initState,
  watch: {
    qrCameraModalOpen() {
      this.qrCameraModalOpen
        ? this.$modal.show('qr-camera-modal')
        : this.$modal.hide('qr-camera-modal')
    },
    'form.type'() {
      if (this.mutation !== 'Edit Contact') {
        // reset form
        const resetForm = initState().form
        this.form = { ...resetForm, type: this.form.type }
      }
    }
  },
  mounted() {
    this.$eventBus.$on('address-mutation-side-pop-close', () => {
      this.closeMutationModal()
    })
  },
  beforeDestroy() {
    this.$eventBus.$off('address-mutation-side-pop-close')
  },
  methods: {
    toggleImportContactMenu() {
      this.importContactMenuOpen = !this.importContactMenuOpen
    },
    importContactsFromCSV() {
      this.$store.dispatch('contacts/importContacts')
      this.toggleImportContactMenu()
    },
    importContactFromQR() {
      this.qrCameraModalOpen = !this.qrCameraModalOpen
      this.toggleImportContactMenu()
    },
    openAddContact() {
      this.mutation = 'Add Contact'
      this.mutationModalOpen = true
      this.$gtag.event('addressbook-add-contact-form-opened')
    },
    initEditContact(contact) {
      console.log('INIT EDIT CONTACT:: ', contact)
      this.mutation = 'Edit Contact'
      this.mutationModalOpen = true
      this.form = { ...contact }
      this.selectedContactId = contact.id
    },
    initAddCurrency(contactId) {
      this.currencyMutation = 'Add Currency'
      this.currencyMutationModalOpen = true
      this.selectedContactId = contactId
    },
    initEditCurrencies(contact) {
      this.currencyMutation = 'Edit Currency'
      this.currencyMutationModalOpen = true
      const currencies = []
      for (const coinTicker in contact.wallets) {
        for (const wallet of contact.wallets[coinTicker]) {
          currencies.push(wallet)
          console.log({ wallet })
        }
      }
      this.currenciesForm = currencies
    },
    closeModals() {
      this.mutationModalOpen && this.closeMutationModal()
      this.currencyMutationModalOpen && this.closeCurrencyMutationModal()
    },
    closeMutationModal() {
      this.mutationModalOpen = false
      this.form = initState().form
    },
    closeCurrencyMutationModal() {
      this.currencyMutationModalOpen = false
      this.currenciesForm = [_currenciesForm()]
    },
    async qrParser(data) {
      try {
        const contact = JSON.parse(data.trim())
        const { type, firstname, walletName, exchangeName, wallets } = contact
        const isValidContact = type && (firstname || walletName || exchangeName)
        if (isValidContact) {
          const saved = await this.$store.dispatch(
            'contacts/insertContact',
            contact
          )
          const contactId = saved.id
          wallets.split(',').forEach(async (w) => {
            const [coinTicker, address] = w.split('://')
            if (coinTicker && address) {
              await this.$store.dispatch('contacts/addCurrencyToContact', {
                coinTicker,
                address,
                contactId
              })
            }
          })
          this.$toast.success('Contact imported successfully!')
        } else {
          this.$toast.error('Invalid Contact Scanned from QR-Code', '')
        }
      } catch (error) {
        this.$toast.error(
          'An error occured while adding the scanned contact.',
          ''
        )
      }
    },
    downloadQrCode(contact) {
      const data = { ...contact }
      let wallets = ''
      this.traverseWallets(contact.wallets, (wallet) => {
        wallets = wallets + `${this.tickerWithAddress(wallet)},`
      })
      data.wallets = wallets.slice(0, -1) // removes trailing comma from wallets string
      delete data.id // remove id to prevent errors on import

      const canvas = document.createElement('canvas')
      QRCode.toCanvas(canvas, JSON.stringify(data), function () {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        const fileName = {
          regular: `${data.firstname}_${data.lastname}`,
          exchange: data.exchangeName,
          wallet: data.walletName
        }
        downloadLink.download = `${fileName[data.type]}.contact.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.qr-code {
  border-radius: 0.5rem !important;
  width: 400px !important;
  height: 350px !important;
}
.dragover {
  background-color: rgba(56, 161, 105, 0.1);
  z-index: 100 !important;
}
//Jonathan Allison
//Tabs styling
.tabs-container {
  max-width: 720px;
  min-width: 420px;
  margin: 40px auto;
  font-family: 'Nunito Sans', Arial, Helvetica, sans-serif;
  font-size: 0.9em;
  color: #888;
}
.tab-container {
  display: flex;
  justify-content: center;
}
</style>
