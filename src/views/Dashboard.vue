<template>
  <qrcode-drop-zone @detect="onFileDrag" @dragover="onDragOver">
    <div class="drop-area h-full" :class="{ dragover: dragover }">
      <!-- wallet view wrapper -->
      <div class="view" @click="sending.active = false">
        <!-- crypto tabs -->
        <!-- this div is the parent for the crypto carousel -->
        <TabsWrapper class="mb-3 overflow-x-auto">
          <TabComponent
            v-for="currency in visibleCurrencies"
            :key="`crpto-cur-${currency}`"
            :active="currency === activeCrypto"
            :onClick="() => (activeCrypto = currency)"
          >
            <img
              class="h-8"
              :src="`./assets/cryptoicons/${currency.toLowerCase()}.svg`"
              :alt="currency"
            />
            <span
              v-if="coinsMeta[currency.toUpperCase()]"
              v-text="currency.toUpperCase()"
              class="mt-2"
            />
          </TabComponent>
          <div class="add-more-crypto-parent">
            <button class="add-more-crypto bg-blue-600">
              <router-link to="/settings/dashboard" v-ripple>
                <div id="add-more-plus-text" class="add-more-crypto-text">
                  +
                </div>
                <div class="add-more-crypto-text">Add More</div>
              </router-link>
            </button>
          </div>
        </TabsWrapper>
        <!-- crypto tabs -->
        <!-- crypto panel (general tabs and actions) -->
        <div class="flex justify-between items-center px-3">
          <!-- current wallet tabs -->
          <div class="flex items-end capitalize">
            <span
              v-ripple="'rgba(0, 0, 0, .1)'"
              class="content-tab"
              :class="{ active: tab === activeTab }"
              v-for="(tab, tabIndex) in tabs"
              :key="`selected-crypto-tab-${tabIndex}`"
              v-text="tab"
              @click="activeTab = tab"
            />
          </div>
          <!-- current wallet tabs -->
          <!-- general wallet actions -->
          <div class="flex items-center">
            <button
              class="btn bg-white"
              v-ripple
              @click.stop="initDashboardWalletImport"
            >
              Import Wallet
              <import-icon class="icon" />
            </button>
            <div class="dropdown">
              <button
                class="bg-blue-600 rounded btn text-white"
                type="button"
                id="newWalletMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                v-ripple="'rgba(255, 255, 255, 0.35)'"
                @click="toggleNewWalletMenu"
              >
                New Wallet
                <plus-icon class="ml-3" color="white" />
              </button>
              <ul
                class="dropdown-menu"
                :class="newWalletMenuOpen && 'show'"
                aria-labelledby="newWalletMenuButton"
              >
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click="
                      () => {
                        initCreateWallet()
                        toggleNewWalletMenu()
                      }
                    "
                    >From Mnemonic</a
                  >
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click="
                      () => {
                        createThrowawayWallet()
                        toggleNewWalletMenu()
                      }
                    "
                    >Throwaway Wallet</a
                  >
                </li>
              </ul>
            </div>
            <!-- Following Sweep Wallet button removed until v2 -->
            <!-- <button
              v-ripple="'rgba(255, 255, 255, 0.35)'"
              class="bg-blue-600 rounded btn text-white"
              @click="
                $store.dispatch(
                  'wallets/sweepWallet',
                  activeCrypto
                )
              "
            >
              Sweep Wallet
              <plus-icon class="ml-3" color="white" />
            </button> -->
          </div>
          <!-- general wallet actions -->
        </div>
        <!-- crypto panel (general tabs and actions) -->

        <!-- wallets view -->
        <div v-if="activeTab === 'wallets'" class="wallets">
          <div
            class="wallet"
            :class="{ 'external-wallet': !wallet.isHDWallet }"
            v-for="(wallet, walletIndex) in wallets[activeCrypto]"
            :key="`${activeCrypto}_wallet-${walletIndex}`"
            @click="() => openWalletModal(wallet)"
          >
            <div class="wallet-section">#{{ walletIndex + 1 }}</div>
            <div class="wallet-section address-section">
              <div
                class="flex items-end justify-between"
                @click.stop="initEditWalletNickname(walletIndex)"
              >
                <!-- Edit Wallet Nickname -->
                <form
                  v-if="
                    nickEditing.enabled && nickEditing.index === walletIndex
                  "
                  v-on:submit.prevent="changeNickname(walletIndex, nickState)"
                  class="flex justify-content-between"
                >
                  <input
                    :id="`wallet-nickname-field-${walletIndex}`"
                    type="text"
                    placeholder="Wallet Nickname"
                    class="field-label"
                    v-model="nickState"
                  />
                  <div class="flex">
                    <button
                      class="btn bg-blue-600 text-white"
                      type="submit"
                      @click.stop
                    >
                      Save
                    </button>
                    <button
                      class="btn bg-red-600 text-white"
                      type="reset"
                      @click.stop="clearNickEditing"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                <template v-else>
                  <span class="field-label" v-if="wallet.nickname">
                    {{ wallet.nickname }}
                  </span>
                  <span class="field-label" v-else-if="wallet.address">
                    Public Address
                  </span>
                  <span class="field-label" v-else-if="wallet.accountId">
                    Account ID
                  </span>
                </template>
                <span
                  class="hidden text-xs text-blue-700 items-center hover:shadow z-30 cursor-pointer"
                >
                  Copied to clipboard
                  <svg
                    class="ml-2 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      fill="green"
                      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"
                    />
                  </svg>
                </span>
              </div>

              <div class="tags">
                <span
                  v-if="wallet.activityCategory === 'wallet-imported'"
                  class="imported-tag"
                  >Imported Wallet</span
                >
              </div>

              <div class="flex items-end">
                <span
                  class="field address"
                  :id="`wallet-${walletIndex}_address`"
                  v-if="wallet.address"
                  >{{ wallet.address }}</span
                >
                <span
                  :id="`wallet-${walletIndex}_accountId`"
                  class="field accId"
                  v-else-if="wallet.accountId"
                  v-text="wallet.accountId"
                />
                <svg
                  @click.stop="copyAddress(walletIndex)"
                  class="ml-1 show-on-hover hover:shadow"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"
                  />
                </svg>
              </div>
            </div>
            <div class="wallet-section balance-section">
              <span class="field-label">Balance</span>
              <div class="field balance">
                <span class="amount mr-1">{{
                  formatNum(wallet.balance, 6)
                }}</span>
                <span>{{ activeCrypto.toUpperCase() }}</span>
              </div>
            </div>

            <div class="wallet-section value-section">
              <span class="field-label">Value</span>
              <span
                class="field"
                v-if="activeCryptoInfo.quote"
                v-text="
                  `${formatCurrencyWithSettings(
                    currencyToGlobalValue(wallet.balance, activeCrypto),
                    5
                  )}`
                "
              />
            </div>

            <div class="flex ml-3">
              <div class="flex items-center">
                <button
                  @click.stop="openSend(wallet)"
                  v-ripple="'rgba(255, 255, 255, .3)'"
                  class="btn bg-blue-700 text-white"
                >
                  Send
                  <send-icon color="white" />
                </button>
                <ellipsis-dropdown
                  :menuItems="[
                    {
                      name: 'exportPrivateKey',
                      text: 'Export Private Key',
                      classes: ['text-blue-900', 'text-xs'],
                      click: function () {
                        exportWallet(wallet)
                      }
                    },
                    {
                      name: 'exportPublicAddress',
                      text: 'Export Public (QR Code) Address',
                      classes: ['text-blue-900', 'text-xs'],
                      click: () => downloadQrCode(wallet)
                    },
                    {
                      name: 'deleteWallet',
                      text: 'Delete Wallet',
                      classes: ['text-red-900', 'text-xs'],
                      click: () => deleteWallet(walletIndex, wallet)
                    }
                    /** removing Sweep for now
                    {
                      name: 'sweepDeleteWallet',
                      text: 'Sweep & Delete Wallet',
                      classes: ['text-red-900', 'text-xs'],
                      click: () => openSweep(walletIndex, wallet),
                      vIf: Number(wallet.balance)
                    }
                    */
                  ]"
                />
              </div>
            </div>
          </div>

          <div
            class="bg-white flex flex-col items-center justify-center p-10"
            v-if="!walletsInView.length"
          >
            <img src="/assets/vectors/wallet-outline.svg" alt="" />

            <p class="text-xl my-2">
              You do not have a {{ activeCrypto.toUpperCase() }} Wallet
            </p>
            <button
              v-ripple
              class="btn rounded-lg bg-blue-100 text-blue-800 font-semibold mt-2 mb-10"
              @click="initCreateWallet"
            >
              Generate
              <span class="capitalize mx-1" v-text="activeCryptoInfo.slug" />
              Wallet
            </button>
          </div>
        </div>
        <!-- end wallets view -->
        <!-- history view -->
        <!-- removing class scss from History child class="information p-5 bg-white my-2 mx-2 overflow-y-auto" was causing scrollbar to appear with overflow and setting white background -->
        <div v-if="activeTab === 'history'">
          <History
            :selectedCrypto="activeCryptoInfo"
            :wallets="walletsInView"
            @updateClassTypeDashboardHistory="updateClassTypeDashboardHistory"
          />
        </div>

        <!-- information view -->
        <div
          v-if="activeTab === 'information'"
          class="information p-5 bg-white my-2 mx-2 overflow-y-auto"
          v-html="parseMarkdown(activeCryptoInfo.description)"
        />
        <!-- information view -->

        <!-- Bottom right total value/balance info -->
        <div class="pricing">
          <span>Total Balance: {{ totalActiveBalance }}</span>
          <span
            >Total Value:
            {{
              formatCurrencyWithSettings(
                currencyToGlobalValue(totalActiveBalance, activeCrypto),
                5
              )
            }}</span
          >
          <span class="field-label">{{ cryptoValue }}</span>
        </div>

        <verify-modal
          :beforeOpen="mfaBeforeOpen"
          :verified="mfaVerified"
          :cancelled="mfaCancelled"
        />
        <div @click.stop>
          <!-- send modal (side pop) -->
          <send-form
            :sending="sending"
            :activeCryptoInfo="activeCryptoInfo"
            @closeSend="closeSend"
          />
          <!-- adding import wallet modal -->
          <import-wallet-modal />
          <!-- end adding import wallet modal -->
        </div>
      </div>
      <!-- wallet view wrapper -->
    </div>

    <!-- modals -->
    <token-link-modal :activeCryptoInfo="activeCryptoInfo" />
    <wallet-modal />
    <sweep-wallet
      :wallets="walletsInView"
      :selectedIndex="sendForm.sweepIndex"
      :submit="sweepWallet"
      @handleChange="handleSweepWalletChange"
    />
  </qrcode-drop-zone>
</template>

<script>
// Components
import PlusIcon from '../components/icons/Plus.vue'
import SendIcon from '../components/icons/Send.vue'
import ImportIcon from '@/components/icons/Download.vue'
import EllipsisDropdown from '@/components/reusables/ellipsisDropdown.vue'
import SweepWallet from '@/components/widgets/SweepWallet.vue'
import SendForm from '@/components/dashboard/SendForm.vue'
import History from '@/components/dashboard/History.vue'
import ImportWalletModal from '@/components/dashboard/ImportWalletModal.vue'
import VerifyModal from '../service/VerifyModal.vue'
import TokenLinkModal from '@/components/dashboard/TokenLinkModal.vue'
import WalletModal from '@/components/dashboard/WalletModal.vue'

// Mixins
import accountMixins from '@/utils/mixins/accountMixins'
import loadingMixin from '@/utils/mixins/loadingMixin'

// Utils
import { mapState, mapGetters } from 'vuex'
import bugReporter from '../logging/BugReporter'
import { markdown } from 'markdown'
import QRCode from 'qrcode'
import * as CryptoJS from 'crypto-js'

export default {
  name: 'DashboardView',
  components: {
    ImportWalletModal,
    SendForm,
    PlusIcon,
    ImportIcon,
    SendIcon,
    History,
    VerifyModal,
    EllipsisDropdown,
    SweepWallet,
    TokenLinkModal,
    WalletModal
  },
  data: () => ({
    importWalletModalOpen: false,
    inputWalletKeyState: null,
    nickEditing: { enabled: false, index: null },
    nickState: null,
    dragover: false,
    activeCrypto: '',
    sending: {
      active: false,
      wallet: {}
    },
    dashboardWalletDefault: null,
    tabs: ['wallets', 'history', 'information'],
    activeTab: 'wallets',
    activeCryptoInfo: {},
    sendForm: {
      wallet: {},
      address: '',
      annotation: '',
      amount: 0,
      gasRate: 'recommended',
      gasPrice: 0,
      ethTxFee: 0
    },
    show2FAModal: true,
    multiFaService: {},
    newWalletMenuOpen: false
  }),
  mixins: [accountMixins, loadingMixin],
  computed: {
    ...mapState(['wallets', 'coinsMeta', 'coinsInfo', 'userSettings']),
    ...mapGetters({
      allWallets: 'allWallets'
    }),
    visibleCurrencies() {
      const visibleCoinTickers = Object.keys(this.wallets).filter((wallet) => {
        return this.userSettings.visibilityToggles[wallet.toLowerCase()]
      })
      return visibleCoinTickers
    },
    walletsInView() {
      const wallets = this.wallets[this.activeCrypto]

      if (!wallets || !wallets.length) return []
      return wallets.filter((wallet) => wallet.address || wallet.accountId)
    },
    canSend() {
      const { amount, address } = this.sendForm
      return amount && address
    },
    user() {
      const activeUser = this.$store.state.accounts.active
      return JSON.parse(JSON.stringify(activeUser))
    },
    cryptoValue() {
      if (!this.activeCryptoInfo.quote) return 0
      const coinInfo = this.activeCryptoInfo
      const quote = coinInfo.quote[this.userCurrency]
      if (!quote) return 'Unable to retrieve value for set currecy.'
      const value = quote.price.toFixed(8)
      return `One unit of ${coinInfo.name} is equal to ${value} ${this.userCurrency}`
    },
    totalActiveBalance() {
      return this.wallets[this.activeCrypto].reduce((total, wallet) => {
        return total + wallet.balance
      }, 0)
    }
  },
  watch: {
    activeCrypto(value) {
      if (import.meta.env.NODE_ENV === 'development' && value === 'tst') {
        // eslint-disable-line
        this.activeCryptoInfo = {
          symbol: 'tst',
          slug: 'Test Standard Token',
          name: 'Test Standard Token',
          category: 'token',
          platform: {
            symbol: 'ETH'
          },
          quote: {
            [this.userCurrency]: 0
          }
        }
        return
      }
      this.activeCryptoInfo = this.coinsInfo.find(
        (coin) => coin.symbol === value.toUpperCase()
      )

      if (this.activeTab === 'history')
        this.$gtag.pageview({
          page_title: `Dashboard - ${this.activeCrypto.toUpperCase()} History`
        })
    },
    activeTab(tab) {
      if (tab === 'history')
        this.$gtag.pageview({
          page_title: `Dashboard - ${this.activeCrypto.toUpperCase()} History`
        })
    },
    importWalletModalOpen() {
      this.importWalletModalOpen
        ? this.$modal.show('import-wallet-modal')
        : this.$modal.hide('import-wallet-modal')
    }
  },
  methods: {
    parseMarkdown(content) {
      return markdown.toHTML(content)
    },
    toggleNewWalletMenu() {
      this.newWalletMenuOpen = !this.newWalletMenuOpen
    },
    // opens import of wallet wit file, qr code or key input
    initDashboardWalletImport() {
      // start of import wallet modal methods
      // open Wallet Modal Pop Up Dialog
      this.openDashboardWalletImportModal(this.activeCrypto)
    },
    openDashboardWalletImportModal(activeCrypto) {
      this.$modal.show('importDashboardWalletModule', { activeCrypto })
    }, // end adding new import wallet modal methods
    copyAddress(walletIndex) {
      const { $toast } = this
      const addressNode = document.getElementById(
        `wallet-${walletIndex}_address`
      )
      const accountIdNode = document.getElementById(
        `wallet-${walletIndex}_accountId`
      )
      const node = addressNode || accountIdNode
      if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(node)
        range.select()
      } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        console.warn('Could not select text in node: Unsupported browser.')
      }
      document.execCommand('copy')
      $toast.success('Address copied to clipboard', '', {
        position: 'center',
        timeout: 1500
      })
    },
    async initCreateWallet() {
      const { $toast } = this

      // Verify user has no more than 5 HD Wallet Addresses
      const generatedWallets = this.$store.state.wallets[
        this.activeCrypto.toLowerCase()
      ].filter((wallet) => {
        return (
          wallet.activityCategory === 'wallet-generated' && wallet.isHDWallet
        )
      })
      const count = generatedWallets.length
      if (count < 5) {
        this.handleCreateWallet() // begin wallet creation
      } else {
        $toast.error('You cannot have more than 5 wallets at one time!', '', {
          position: 'center',
          timeout: 1500
        })
      }
    },
    handleCreateWallet() {
      // Handle gTag for TICKER-hd-wallet-created
      this.$gtag.event(`${this.activeCrypto}-hd-wallet-created`)

      // If activeCrypto is a coin create wallet
      const config =
        this.$walletListConfig.walletList[this.activeCrypto.toLowerCase()]
      if (config.coinType === 'altcoin') this.createWallet()
      else if (config.platform && config.platform.blockchain === 'eth') {
        // Prompt user to select ETH wallet to link with ERC20 Token
        this.openTokenLinkModal()
      } else {
        this.$toast.error(
          'Sparkplate is not configured to create a wallet for this chain.',
          ''
        )
      }
    },
    async createWallet() {
      try {
        this.showLoader()
        await this.$store.dispatch(
          'wallets/generateWallet',
          this.activeCrypto.toLowerCase()
        )
      } catch (err) {
        console.error(err)
        this.$toast.error('There was an error generating a new wallet.', '')
      } finally {
        this.hideLoader()
      }
    },
    async createThrowawayWallet() {
      // Handle gTag for TICKER-throwaway-wallet-created
      this.$gtag.event(`${this.activeCrypto}-throwaway-wallet-created`)

      const activeCryptoConfig =
        this.$walletListConfig.walletList[this.activeCrypto.toLowerCase()]
      const isToken = activeCryptoConfig.coinType === 'token'
      const blockchainTicker = isToken
        ? activeCryptoConfig.platform.blockchain
        : this.activeCrypto.toLowerCase()
      try {
        this.showLoader()
        const wallet = await this.$store.dispatch(
          'wallets/generateBasicWallet',
          blockchainTicker
        )
        if (isToken) {
          this.$modal.show('tokenLinkModal', { throwawayWallet: wallet })
        }
      } catch (err) {
        console.error(err)
        this.$toast('There was an error generating a new wallet.')
      } finally {
        this.hideLoader()
      }
    },
    openSweep(sweepIndex, wallet) {
      this.sendForm.sweepIndex = sweepIndex
      this.sendForm.wallet = wallet
      this.$modal.show('sweep-wallet')
    },
    async deleteWallet(walletIndex, wallet) {
      const validated = await this.validateWalletDeletion(wallet)
      if (!validated)
        return this.$toast.error(
          'You must export wallets with value before deletion.',
          ''
        )
      const { activeCrypto, $store, $toast } = this
      try {
        $toast.question(
          'Are you sure you want to delete this wallet?',
          'Caution!',
          {
            timeout: 20000,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            position: 'center',
            buttons: [
              [
                '<button><b>YES</b></button>',
                function (instance, toast) {
                  $store.dispatch('wallets/removeWallet', {
                    crypto: activeCrypto,
                    index: walletIndex
                  })
                  instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
                  $toast.success('Wallet deleted successfully!', '', {
                    position: 'center',
                    timeout: 1000
                  })
                },
                true
              ],
              [
                '<button>NO</button>',
                function (instance, toast) {
                  instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
                }
              ]
            ]
          }
        )
      } catch (err) {
        console.log(err)
        bugReporter.catchError(err)
      }
    },
    exportWallet(wallet) {
      return this.$store.dispatch('wallets/exportWallet', {
        crypto: this.activeCrypto,
        walletData: wallet
      })
    },
    initEditWalletNickname(walletIndex) {
      this.nickEditing.enabled = true
      this.nickEditing.index = walletIndex
      this.$nextTick(() => {
        const field = document.getElementById(
          `wallet-nickname-field-${walletIndex}`
        )
        field.focus()
      })
    },
    clearNickEditing() {
      this.nickEditing.index = null
      this.nickEditing.enabled = false
      this.nickState = null
    },
    changeNickname(walletIndex, nickname) {
      this.$store.dispatch('wallets/changeNickname', {
        crypto: this.activeCrypto,
        index: walletIndex,
        nickname: nickname
      })
      this.$forceUpdate()
      this.clearNickEditing()
    },
    openSend(wallet) {
      this.sending.active = true
      this.sending.wallet = wallet
    },
    closeSend() {
      this.sending.active = false
      this.sending.wallet = {}
    },
    openTokenLinkModal() {
      this.$modal.show('tokenLinkModal')
    },
    closeTokenLinkModal() {
      this.$modal.hide('tokenLinkModal')
    },
    fillAmount(quota = 1) {
      this.sendForm.amount = Number(this.sendForm.wallet.balance) * quota
    },
    handleSweepWalletChange(data) {
      this.sendForm.address = data.value.address
      this.fillAmount()
    },
    async sweepWallet() {
      const { sendForm, activeCrypto, $store, $toast } = this
      this.sendCrypto()
      this.$modal.hide('sweep-wallet')
      try {
        $store.dispatch('wallets/removeWallet', {
          crypto: activeCrypto,
          index: sendForm.sweepIndex
        })
        $toast.success('Wallet swept and deleted!')
      } catch (e) {
        $toast.error('Cannot sweep wallet!', '')
      }
    },
    downloadQrCode(wallet) {
      this.$toast.info('Please enter the wallet password', 'Error!', {
        timeout: 20000,
        displayMode: 'once',
        id: 'inputs',
        zindex: 999,
        title: 'Inputs',
        message: 'Examples',
        position: 'center',
        drag: false,
        inputs: [['<input type="text">']],
        buttons: [
          [
            '<button><b>Confirm</b></button>',
            (instance, toast, button, e, inputs) => {
              const password = inputs[0].value
              if (password) {
                const crypto =
                  this.activeCrypto.toLowerCase() ||
                  wallet.currency.coinTicker()
                const data = {
                  exportWalletObj: {
                    wif: wallet.wif,
                    privateKey: wallet.privateKey
                  },
                  crypto
                }
                const canvas = document.createElement('canvas')
                const walletString = JSON.stringify(data)
                const encryptedWalletString = CryptoJS.AES.encrypt(
                  walletString,
                  password
                ).toString()
                QRCode.toCanvas(canvas, encryptedWalletString, function () {
                  const pngUrl = canvas
                    .toDataURL('image/png')
                    .replace('image/png', 'image/octet-stream')
                  const downloadLink = document.createElement('a')
                  downloadLink.href = pngUrl
                  downloadLink.download = `sparkplate_${crypto}.wallet.png`
                  document.body.appendChild(downloadLink)
                  downloadLink.click()
                  document.body.removeChild(downloadLink)
                })
              } else {
                this.$toast.error('No Password Provided', 'Error!', {
                  timeout: 2000,
                  zindex: 999,
                  position: 'center'
                })
              }
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
            },
            true
          ]
        ]
      })
    },
    openWalletModal(wallet) {
      this.$modal.show('walletModal', { wallet })
    },
    async validateWalletDeletion(wallet) {
      if (!wallet.balance) return true
      // if value exists wait for user to complete exporting
      const exported = await this.exportWallet(wallet)
      return exported
    },
    updateClassTypeDashboardHistory(transactionRecord) {
      // console.log('** Dashboard updateClassTypeDashboardHistory transactionRecord>>', transactionRecord)
      this.$store.dispatch('updateTransactionType', transactionRecord)
    }
  },
  async created() {
    this.showLoader()
    await this.$store.dispatch('wallets/getBalances', this.activeCrypto)
  },
  beforeMount() {
    // this is where activeCrypto gets set to the default state
    // add support for saving last token wallet active in local storage
    // NOTE: dashboard_wallet_default should have a default value in db for clean installs
    var dashboardWalletDefault = localStorage.getItem(
      'dashboard_wallet_default'
    )
    // NOTE: Special case for clean installs, check if null string exists
    if (dashboardWalletDefault === 'null' || dashboardWalletDefault === null) {
      // btc is at object 4 but setting literal value (setting btc as default for clean installs)
      this.activeCrypto = 'btc'
      dashboardWalletDefault = this.activeCrypto
    }
    // Need to make sure dashboard_wallet_default is not null for clean installs
    this.activeCrypto = dashboardWalletDefault
    this.hideLoader()
  },
  beforeDestroy() {
    // saves last token visited and beforeDestroy gets executed when you move away from Dashboard
    localStorage.setItem('dashboard_wallet_default', this.activeCrypto)
    if (this.getBalanceInterval) clearInterval(this.getBalanceInterval)
  }
}
</script>

<style lang="scss" scoped>
.add-more-crypto-parent {
  // absolute positioning will keep + add more visible at all times
  position: absolute;
  right: 0;
}

.add-more-crypto {
  text-align: center;
  border: solid 1px;
  border-radius: 5px;
  border-color: rgb(206, 201, 201);
  // text-shadow: .5px .5px rgb(207, 201, 201);
  box-shadow: 1px 1px rgb(235, 232, 232);
  padding: 1px;
  width: 60px;
  margin-right: 10px;
}

#add-more-plus-text {
  font-weight: bold;
  // increase font size to make + sign larger and more visible
  font-size: 1.5em;
}

.add-more-crypto:hover {
  border-color: green;
  text-decoration-color: transparent;
}

.add-more-crypto-text {
  text-align: center;
  font-weight: bold;
  background-color: transparent;
  font-family: 'Nunito Sans', Arial, Helvetica, sans-serif;
  font-size: 0.95em;
  color: white;
}

.add-more-crypto-text.hover {
  text-decoration-color: transparent;
}
// NOTE: this will remove text-decoration hover for all links on Dashboard
// was not able to disable just for add-more-crypto-text
a:hover {
  text-decoration: none;
}

.content-tab {
  @apply font-semibold py-3 px-1 mb-2 mx-3 cursor-pointer select-none;
  &.active {
    @apply relative;

    &:after {
      @apply absolute w-full bottom-0 left-0 bg-gray-900;
      content: '';
      height: 2px;
    }
  }
}

.wallets {
  @apply px-2 py-3 mb-5 overflow-y-auto;
  height: 60%;

  .wallet {
    @apply px-4 pt-3 pb-5 rounded bg-white flex mb-4 shadow-xs items-center cursor-pointer;
    border: 1px solid #80808026;
    transition: all ease-in-out 0.3s;

    .show-on-hover {
      @apply hidden ml-1;
      transition: all ease-in-out 0.3s;
    }
    .view-on-hover {
      visibility: hidden;
      transition: all ease-in-out 0.3s;
    }

    &:hover {
      @apply shadow-lg;

      .show-on-hover {
        @apply flex;
      }

      .view-on-hover {
        visibility: visible;
      }
    }

    .wallet-section {
      @apply flex flex-col mx-3;

      &.address-section {
        width: 33.3333333%;
      }

      &.balance-section,
      &.value-section {
        width: 10%;
      }
    }

    .field-label {
      @apply text-base text-gray-700;
      font-weight: 600;
    }

    .field {
      @apply text-gray-900 mt-4 font-semibold;
      background-color: #f1efef;
      padding: 5px 10px;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.accId,
      &.address {
        @apply max-w-sm text-sm;
      }
      &.accId,
      &.address {
        @apply max-w-md;
      }
      &.balance {
        .amount {
          max-width: 3rem;
        }
      }

      &::selection {
        color: inherit;
      }
    }

    .btn {
      @apply rounded-md text-sm my-1 text-center flex items-center font-semibold;
      padding: 0.25rem 1rem !important;
    }
  }

  .external-wallet {
    background: linear-gradient(
      90deg,
      rgba(199, 251, 133, 1) 0%,
      rgba(126, 223, 90, 1) 100%
    );
  }
}
.pricing {
  @apply relative flex flex-col justify-end items-end top-0 right-0;
}

.qr-code {
  border-radius: 0.5rem !important;
  width: 400px !important;
  height: 350px !important;
}

.dragover {
  background-color: rgba(56, 161, 105, 0.1);
  z-index: 100 !important;
}
</style>
