<template>
  <modal
    v-show="isModalVisible"
    name="importDashboardWalletModule"
    height="auto"
    classes="p-2"
    @before-open="onModalOpen"
    @closed="onModalClose"
  >
    <div
      v-if="mode === 'default'"
      class="bg-white flex flex-col items-center justify-center p-20 h-80 w-100 pl-4 px-2"
    >
      <p class="text-xl my-2 font-bold">Import Wallet Module</p>
      <p class="text-sm my-2 center-text">
        Select the option you would like to use to import your Wallet.
      </p>
      <div class="flex items-center justify-center pt-10">
        <button
          v-ripple="'rgba(0, 0, 0, .1)'"
          class="btn bg-white"
          @click="importFile"
        >
          Import File
          <import-icon class="icon" />
        </button>
        <button
          v-ripple="'rgba(0, 0, 0, .1)'"
          class="btn bg-white"
          @click="setMode('qrScanner')"
        >
          Import QR Code
          <qr-code-icon class="icon" />
        </button>
      </div>
      <div class="import-key-label">
        <div>
          <label>Import Private Key Value:</label>
        </div>
      </div>
      <div class="items-center" style="width: 99%">
        <form @submit.prevent="submitWalletKey">
          <div class="input-field">
            <input
              v-model="form.wallet_key_input"
              type="text"
              class="wallet-key-input-field border-b border-gray-500 w-99"
            />
          </div>
          <span class="flex items-center justify-center px-10 pt-1 pl-1">
            <button type="submit" class="btn bg-blue-500 text-white px-1 py-1">
              Submit Key
            </button>
          </span>
        </form>
      </div>
    </div>
    <div
      v-else-if="mode === 'qrScanner'"
      class="bg-white flex flex-col items-center justify-center p-10"
    >
      <div style="width: 50px">
        <qr-code-icon style="fill: #38a169" class="icon" />
      </div>
      <p class="text-xl my-2">Please scan a wallet QR code to import</p>
      <div class="flex flex-col items-center justify-center">
        <qrcode-stream
          class="qr-code rounded-lg"
          style="border-radius: 0.5rem !important"
          @init="onQrInit"
          @decode="onQrDecode"
        >
          <!-- qrLoading is not working fix later or remove or replace with better functionality -->
          <!-- <div class="loading-indicator text-center" v-if="qrLoading">Loading...</div> -->
        </qrcode-stream>
      </div>
    </div>
    <!-- <div class="flex items-center justify-center pt-10">
      <button
        v-ripple="'rgba(255, 255, 255, .2)'"
        @click.stop="onModalClose"
        class="btn text-white bg-red-600"
      >Cancel</button>
    </div> -->
  </modal>
</template>

<script>
import ImportIcon from '@/components/icons/Download.vue'
import QrCodeIcon from '@/components/icons/QrCode.vue'
import * as CryptoJS from 'crypto-js'
const initialState = () => ({
  mode: 'default',
  qrLoading: false,
  isModalVisible: true,
  isQrScanner: false,
  activeCrypto: '',
  method: '',
  form: {
    wallet_key_input: ''
  }
})

export default {
  name: 'DashboardWalletImportModal',
  components: {
    ImportIcon,
    QrCodeIcon
  },
  data: initialState,
  computed: {
    selectedTypeHeader() {
      const { type } = this.form
      // console.log('** type >>', type)
      return type ? ` - ${type}` : ''
    },
    ifQrScanner() {
      // console.log('** ifQrScanner hit >> isQrScanner _>', this.isQrScanner)
      const stateOfScanner = !this.isQrScanner
      return stateOfScanner
    }
  },
  methods: {
    addWalletFromModal(walletData) {
      this.$store.dispatch('wallets/importWalletQr', walletData)
    },
    setFormKey(key, value) {
      // console.log('set form key >>', key + ' value ' + value)
      this.form[key] = value
    },
    closeModal() {
      this.isModalVisible = false
    },
    setMode(mode) {
      this.mode = mode
    },
    invalidQRToast(message) {
      this.$toast.error(message, 'Wallet QR', {
        timeout: 2000,
        zindex: 999,
        position: 'center'
      })
    },
    qrImportSuccessfullToast() {
      this.$toast.success('Wallet imported successfully!', '', {
        position: 'center',
        timeout: 1000
      })
    },
    async importFile() {
      try {
        const wallet = await this.$store.dispatch(
          'wallets/importFromJSON',
          this.activeCrypto
        )
        console.log('** dump wallet async importFile >>', wallet)
        this.$modal.hide('importDashboardWalletModule')
      } catch (err) {
        console.error(err)
        this.$toast.error(err.message, 'Cannot import wallet')
      }
    },
    async submitWalletKey() {
      const form = this.form
      const privateKey = form.wallet_key_input.trim()
      if (privateKey === '') {
        this.$toast.info('Wallet Private Key Is Empty, Please Provide Key')
      } else {
        try {
          const wallet = await this.$store.dispatch(
            'wallets/importWalletWithKey',
            {
              exportWalletObj: {
                privateKey: privateKey,
                wif: privateKey
              },
              crypto: this.activeCrypto
            }
          )
          if (wallet.balance === 0) {
            this.$toast.info('Wallet Balance Is 0')
          }
          this.$modal.hide('importDashboardWalletModule')
        } catch (err) {
          console.log('*** submit wallet key catch error ***', err)
          console.error(err)
          this.$toast.error(
            'There was an error importing wallet by key.',
            'Cannot import wallet'
          )
        }
      }
    },
    qrParser(data) {
      this.$toast.info('Please enter the wallet password', 'Wallet QR', {
        timeout: 20000,
        displayMode: 'once',
        id: 'inputs',
        zindex: 999,
        title: 'Inputs',
        message: 'Examples',
        position: 'center',
        drag: false,
        inputs: [['<input type="password">']],
        buttons: [
          [
            '<button><b>Confirm</b></button>',
            (instance, toast, button, e, inputs) => {
              const password = inputs[0].value.trim()
              if (password) {
                // console.log('** if password hit')
                try {
                  const decryptedQRData = CryptoJS.AES.decrypt(
                    data,
                    password
                  ).toString(CryptoJS.enc.Utf8)
                  // console.log('** decrypted qr data > ', decryptedQRData.trim())
                  const walletData = JSON.parse(decryptedQRData.trim())
                  // console.log('** walletData > ', walletData)
                  const isValidWallet =
                    (!!walletData.exportWalletObj.wif && !!walletData.crypto) ||
                    (!!walletData.exportWalletObj.privateKey &&
                      !!walletData.crypto)
                  if (isValidWallet) {
                    // console.log('** isValidWallet hit')
                    let exists = false
                    // Check if wallet already exists
                    // original code from Dashboard was using this.wallets
                    // const currentWallets = this.wallets[walletData.crypto]
                    // getting current state of wallets and using that in modal
                    const currentWallets =
                      this.$store.state.wallets[this.activeCrypto]
                    // console.log('** dump wallets in Modal .>', currentWallets)
                    // console.log('** current wallets ->', currentWallets)
                    currentWallets.forEach((w) => {
                      // NOTE: Ethereum will not have a wif set
                      if (w.privateKey !== undefined) {
                        if (
                          w.privateKey === walletData.exportWalletObj.privateKey
                        )
                          exists = true
                        // console.log('** currentWallets for privateKey loop > ', w)
                      } else if (w.wif !== undefined) {
                        if (w.wif === walletData.exportWalletObj.wif)
                          exists = true
                        // console.log('** currentWallets for wif loop > ', w)
                      }
                    })
                    // console.log('** boolen wallet exists >', exists)
                    if (!exists) {
                      // console.log('** wallet does not exist so try adding')
                      this.addWalletFromModal(walletData)
                      this.qrImportSuccessfullToast()
                      this.$modal.hide('importDashboardWalletModule')
                    } else {
                      // console.log('** wallet ALREADY exists so try adding')
                      this.invalidQRToast('Wallet already exists')
                    }
                  } else {
                    this.invalidQRToast(
                      'Invalid Wallet (else) Imported from QR-Code'
                    )
                  }
                } catch (error) {
                  // console.log('** qrParser try catch error >', error)
                  this.invalidQRToast(
                    'Invalid Wallet (catch error) Imported from QR-Code'
                  )
                }
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
    onModalOpen(event) {
      // console.log('** onModal Open hit')
      const { activeCrypto } = event.params
      this.mode = 'default'
      console.log('** onModalOpen activeCrypto passed -> ', activeCrypto)
      // activeCrypo needs to be passed for wallet import
      this.activeCrypto = activeCrypto
      // this.isModalVisible = true
      // method may not be needed, setting to test or now
      this.method = 'test'
    },
    resetState() {
      // console.log('** resetState hit, called when user clicks outside of Modal or closes modal?')
      this.isModalVisible = false
      Object.assign(this.$data, initialState())
    },
    onModalClose() {
      // console.log('** on modal close **')
      // this.closeModal()
      this.resetState()
    }
  }
}
</script>

<style lang="scss">
.text-overflow-ellipsis {
  text-overflow: ellipsis;
}
.import-key-label {
  margin: 25px 0 0 5px;
  font-weight: bold;
  font-size: 1em;
}
.wallet-key-input-field {
  font-size: 0.9rem;
}
</style>
