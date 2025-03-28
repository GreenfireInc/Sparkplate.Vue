<template>
  <side-pop
    id="send-crypto"
    pop-icon="./assets/vectors/send.svg"
    :active="sending.active"
    :title="`Send ${activeCryptoInfo.name}`"
    @closeSidePop="closeSend"
  >
    <form class="send-crypto mt-10" @submit.prevent="sendCrypto">
      <div
        class="flex items-center justify-between border-b-2 border-blue-600 pb-2 mb-2"
      >
        <input
          v-model="sendForm.amount"
          type="number"
          value="0.000"
          min="0"
          step="0.00000001"
          class="text-lg font-semibold w-40"
          inputmode="decimal"
          required
          @keypress="handleNumInput"
        />
        <div class="flex items-center">
          <span
            v-for="{ quota, text } in sendQuotaOptions"
            :key="`send-quota-${text}`"
            class="px-2 text-sm border text-blue-800 bg-blue-100 border-blue-300 rounded ml-1 cursor-pointer"
            @click="fillAmount(quota)"
            v-text="text"
          />
          <span
            class="font-semibold uppercase text-lg ml-2"
            v-text="activeCrypto"
          />
        </div>
      </div>
      <div class="flex items-center justify-between text-lg font-semibold mb-6">
        <span>{{
          formatCurrencyWithSettings(
            activeCryptoInfo &&
              activeCryptoInfo.quote &&
              activeCryptoInfo.quote[userCurrency] &&
              activeCryptoInfo.quote[userCurrency].price
              ? activeCryptoInfo.quote[userCurrency].price * sendForm.amount
              : 0,
            5
          )
        }}</span>
        <span>{{ userCurrency }}</span>
      </div>
      <div class="flex items-center justify-between mb-6">
        <span>Receiver</span>
        <select v-model="receiver" class="form-control w-auto">
          <option selected value="custom">Choose contact</option>
          <option
            v-for="contact in relevantContacts"
            :key="contact.id"
            :value="contact"
            v-text="`${contact.firstname} ${contact.lastname}`"
          />
        </select>
      </div>
      <select
        v-if="receiver !== 'custom'"
        v-model="sendForm.address"
        class="form-control bg-gray-200 mb-6"
      >
        <option selected disabled>Select Wallet Address</option>
        <option
          v-for="wallet in receiver.wallets[activeCrypto]"
          :key="'contact-wallet-' + wallet.id"
          :value="wallet.address"
          v-text="tickerWithAddress(wallet)"
        />
      </select>
      <input
        v-else
        v-model="sendForm.address"
        type="text"
        :placeholder="`${activeCryptoInfo.name} address`"
        class="py-3 px-2 rounded bg-gray-200 mb-6 block w-full font-semibold form-control"
        spellcheck="false"
        required
      />

      <!-- Domain Address Resolution Display Info -->
      <domain-resolution-badge
        v-if="domainAddress.enabled"
        :domain-address="domainAddress"
        :currency="activeCrypto"
      />

      <textarea
        v-if="loggedUserData.annotationsToggle"
        v-model="sendForm.annotation"
        placeholder="Annotation"
        class="py-3 px-2 rounded bg-gray-200 mb-6 block w-full font-semibold form-control"
      />
      <div v-if="isEthTx" class="flex items-center justify-between mb-6">
        <span class="text-lg font-medium" />
        <a href="#" class="flex items-center text-blue-500 hover:text-blue-700">
          Gas station
          <img src="/assets/vectors/gas.svg" alt="Gas" class="h-6 ml-2" />
        </a>
      </div>

      <!-- Gas Prices Displayed -->
      <div v-if="isEthTx" class="grid grid-cols-4 gap-x-3 mb-3">
        <div
          v-for="(txCost, i) in gasPriceList"
          :key="`gas_suggestion-${i}`"
          class="border-2 cursor-pointer border-blue-300 p-2 rounded flex flex-col items-center text-xs justify-between"
          :class="{ 'border-blue-600': txCost.name === sendForm.gasRate }"
          @click="setGasPriceSelection(txCost)"
        >
          <p
            class="font-semibold text-gray-600 capitalize"
            v-text="txCost.name"
          />
          <p class="flex flex-col items-center my-2 text-gray-800">
            <span class="border-b leading-6 font-semibold"
              >{{ txCost.price }} GWEI</span
            >
            <span>{{
              formatCurrencyWithSettings(
                (txCost.price / 1000000000) *
                  activeCryptoInfo.quote[userCurrency].price,
                5
              )
            }}</span>
          </p>
          <span>~{{ txCost.wait }} minutes</span>
        </div>
        <!-- Custom ETH gasPrice not linked to anything -->
        <!-- Remove and reintroduce in v2 or v3 -->
        <!-- <div
          class="border-2 border-blue-300 p-2 rounded flex flex-col items-center text-xs justify-between"
        >
          <p class="font-semibold">Customize</p>
          <input type="text" class="border-b border-gray-500 w-16" />
        </div> -->
      </div>

      <!-- ETH TX Fee -->
      <p v-if="sendForm.ethTxFee.fee" class="leading-6 text-lg mt-4 mb-2">
        <span class="mr-2">Transaction fee:</span>
        <span class="font-semibold mr-2">{{ formattedEthTxFee }} ETH</span>
        <span
          >({{
            formatCurrencyWithSettings(
              currencyToGlobalValue(formattedEthTxFee, 'eth'),
              5
            )
          }})</span
        >
      </p>
      <p v-if="sendForm.ethTxFee.fee" class="leading-6 text-lg mb-4">
        <span class="mr-2">Remaining balance:</span>
        <span class="font-semibold mr-2"
          >{{ formatNum(ethTxRemainingBalance) }} ETH</span
        >
        <span>
          ({{
            formatCurrencyWithSettings(
              currencyToGlobalValue(ethTxRemainingBalance, 'eth')
            )
          }})
        </span>
      </p>

      <button
        class="py-1 px-5 mt-4 rounded text-white hover:shadow"
        type="submit"
        :class="{
          'bg-blue-600 hover:bg-blue-700': sendForm.amount && sendForm.address,
          'bg-blue-300': !sendForm.amount || sendForm.address
        }"
      >
        Confirm & send
      </button>
    </form>
  </side-pop>
</template>

<script>
// Components
import SidePop from '@/components/widgets/SidePop.vue'
import DomainResolutionBadge from '@/components/domains/ResolutionBadge.vue'

// Utils
import { utils } from 'ethers'
import { getGasPrices, getEthTxFee } from '@/factory'
import bugReporter from '@/logging/BugReporter'
import EmailClientService from '@/service/emailClientService'

// Mixins
import accountMixins from '@/utils/mixins/accountMixins'
import domainMixins from '@/utils/mixins/domainMixins'
import ethGasPriceMixins from '@/utils/mixins/ethGasPriceMixins'
import walletMixins from '@/utils/mixins/walletMixins'

const initData = () => ({
  sendForm: {
    wallet: {},
    address: '',
    annotation: '',
    amount: 0,
    gasRate: 'recommended',
    ethTxFee: 0
  },
  domainAddress: {
    enabled: false,
    domain: '',
    address: ''
  },
  sendQuotaOptions: [
    {
      text: '1/4',
      quota: 0.25
    },
    {
      text: 'Half',
      quota: 0.5
    },
    {
      text: 'All',
      quota: 1
    }
  ],
  receiver: 'custom',
  gweiEthDivisor: 1000 * 1000 * 1000
})

export default {
  name: 'DashboardSendForm',
  components: {
    SidePop,
    DomainResolutionBadge
  },
  mixins: [accountMixins, domainMixins, ethGasPriceMixins, walletMixins],
  props: {
    sending: {
      type: Object,
      required: true
    },
    activeCryptoInfo: {
      type: Object,
      require: true
    }
  },
  data: initData,
  computed: {
    activeCrypto() {
      if (!this.activeCryptoInfo.symbol) return ''
      return this.activeCryptoInfo.symbol.toLowerCase()
    },
    isEthTx() {
      if (!this.activeCrypto) return false
      const isEth = this.activeCrypto === 'eth'
      const activeCrypto = this.$walletListConfig.walletList[this.activeCrypto]
      const isEthToken =
        activeCrypto.platform && activeCrypto.platform.blockchain === 'eth'
      return isEth || isEthToken
    },
    relevantContacts() {
      return this.contacts.filter(
        (contact) => this.activeCrypto in contact.wallets
      )
    },
    gasPrice() {
      return this.gasPriceList[this.sendForm.gasRate].price
    },
    gasPriceList() {
      const { fast, fastWait, average, avgWait, safeLow, safeLowWait } =
        this.gasPrices
      return {
        slow: {
          name: 'slow',
          wait: safeLowWait,
          price: safeLow
        },
        recommended: {
          name: 'recommended',
          wait: avgWait,
          price: average
        },
        fast: {
          name: 'fast',
          wait: fastWait,
          price: fast
        }
      }
    },
    formattedEthTxFee() {
      // Returns the estimated TX fee in Ether as a string value
      if (!this.sendForm.ethTxFee.fee) return 0
      const formattedGwei = utils.formatUnits(this.sendForm.ethTxFee.fee, 18)
      const parsedGwei = utils.parseUnits(formattedGwei, 'gwei')
      const formattedEther = utils.formatEther(parsedGwei)
      console.log({ formattedGwei, parsedGwei, formattedEther })
      return formattedEther
    },
    ethTxRemainingBalance() {
      // Returns estimated remaining balance of Ether as a number
      if (!this.sendForm.ethTxFee.fee) return 0
      const balance =
        this.sendForm.wallet.balance -
        this.formattedEthTxFee -
        this.sendForm.amount
      return balance
    }
  },
  watch: {
    activeCryptoInfo() {
      if (this.sending.active) this.closeSend()
    },
    'sendForm.amount'() {
      if (this.isEthTx) this.calculateEthTxFee()
    },
    gasPrice() {
      if (this.isEthTx) this.calculateEthTxFee()
    },
    async 'sendForm.address'(address) {
      // Handle HR Addresses
      const isDomain = this.isDomain(address)
      if (isDomain) {
        // When address is updated and matches domain pattern
        // check for address on that domain
        this.domainAddress = {
          enabled: true,
          address: '',
          domain: address,
          loading: true,
          error: ''
        }
        try {
          const { address: resolvedAddress, service } =
            await this.resolveAddressFromDomain({
              domain: address,
              coinTicker: this.activeCrypto
            })
          this.domainAddress.service = service
          this.domainAddress.address = resolvedAddress
          if (this.isEthTx) this.calculateEthTxFee()
        } catch (err) {
          // ignore errors coming from previous inputs
          if (this.domainAddress.domain === address)
            this.domainAddress.error = err.message
        } finally {
          // disable loading if most recent input is resolved
          if (this.domainAddress.domain === address)
            this.domainAddress.loading = false
        }
      } else {
        if (this.isEthTx) this.calculateEthTxFee()
        // Disable domain address
        this.disableDomainAddress()
      }
    },
    'sending.active'(open) {
      if (open) {
        if (this.isEthTx) this.initFetchGasPrices()
        Object.assign(this.sendForm.wallet, this.sending.wallet)
      } else {
        this.stopFetchGasPrices()
        Object.assign(this.$data, initData())
      }
    }
  },
  methods: {
    setGasPriceSelection(selection) {
      this.sendForm.gasRate = selection.name
    },
    async calculateEthTxFee() {
      const { wallet, address, amount } = this.sendForm
      if (!address || !amount || !this.gasPrice) return

      const transactionObject = {
        from: wallet.address,
        to: this.domainAddress.address || address,
        gasPrice: this.gasPrice,
        value: amount,
        network:
          this.userSettings.networkSelection[this.activeCrypto.toLowerCase()]
      }

      this.sendForm.ethTxFee = await getEthTxFee(transactionObject)
    },
    validateDomainAddress(canSend) {
      // If address is a domain ensure address is resolved and set
      const { enabled, domain, address } = this.domainAddress
      if (enabled) {
        if (!address) {
          canSend.status = false
          canSend.message += `${this.activeCrypto.toUpperCase()} address could not be resolved for ${domain}`
        } else {
          this.sendForm.address = address
        }
      }
    },
    async sendCrypto() {
      const { wallet, address, amount } = this.sendForm
      const { $toast } = this
      const canSend = { status: true, message: '' }
      // check if the user has their address book toggle on
      if (this.loggedUserData.addressBookToggle) {
        for (let i = 0; i < this.relevantContacts.length; i++) {
          // Get relevant contact wallets
          const relevantContact = this.relevantContacts[i]
          console.log('i: ', i, '\nrevlevantContact: ', relevantContact)
          const contactWallets = relevantContact.wallets[this.activeCrypto]
          // Check if address is in contacts walletList
          const isAddressInWallets = contactWallets.reduce(
            (addressFound, wallet) => {
              return addressFound ? addressFound : wallet.address === address
            },
            false
          )
          if (isAddressInWallets) break

          // don't send if address not in address book
          const isFinalContact = i === this.relevantContacts.length - 1
          if (
            this.relevantContacts[i].currencyAddress !== address &&
            isFinalContact
          ) {
            canSend.status = false
            canSend.message +=
              'Only send to contact in addressbook is enabled.\n'
          }
        }
      }
      // check if address is prefixed with the ticker symbol
      if (this.loggedUserData.prefixedAddressesToggle) {
        const expectedPrefix = `${this.activeCrypto}://`
        const addressPrefix = address.substr(0, expectedPrefix.length)
        // compare actuall prefix with expected prefix
        if (expectedPrefix !== addressPrefix) {
          canSend.status = false
          canSend.message +=
            'Only send to addresses prefixed with their ticker symbol.\n'
        }
      }
      // check if annotation is required
      if (this.loggedUserData.annotationsToggle && !this.sendForm.annotation) {
        canSend.status = false
        canSend.message += 'Require Annotations is enabled.\n'
      }
      // check if 2FA enabled
      const authenticated = await this.validateAuthentication(
        'mfaRequireOnDashboardSend'
      )
      if (!authenticated) {
        canSend.status = false
        canSend.message += 'Unable to authenticate transaction.\n'
      }

      // Handle case that address is a human readable address
      this.validateDomainAddress(canSend)

      if (!canSend.status) {
        $toast.error(canSend.message, 'ERROR:', { position: 'center' })
        return
      }

      const loader = this.$loader()
      try {
        // Use this.sendForm.address directly to ensure correct address is used.
        const txData = { wallet, toAddress: this.sendForm.address, amount }
        if (this.activeCrypto === 'eth') {
          txData.gasPrice = this.gasPrice
        }
        const txid = await this.$store.dispatch('wallets/sendToAddress', txData)
        $toast.success(txid, 'TX ID')

        // Capture send currency event
        this.$gtag.event(
          `dashboard-send-currency-${this.activeCrypto.toLowerCase()}`
        )

        this.closeSend()
      } catch (err) {
        $toast.error(err.message, 'Error Sending')
        console.error(err)
      } finally {
        loader.hide()
      }
    },
    async sendEmail() {
      const userFullName =
        this.loggedUserData.firstname + ' ' + this.loggedUserData.lastname
      const emailClient = new EmailClientService(
        this.$store.state.userSettings.emailConfig
      )
      await emailClient.connect()
      await emailClient.sendMail({
        to: this.receiver.email,
        subject: `Sparkplate.vue | Crypto from ${userFullName}`,
        text: `Hello ${this.receiver.firstname},\n\n    You will be receiving ${this.sendForm.amount} of ${this.activeCrypto} from me shortly. Should you have any questions or concerns please don't hesitate to reach out.\n\nThank you!\n\n${userFullName}\n${this.loggedUserData.email}`
      })
    },
    async fetchGasPrices() {
      try {
        const data = await getGasPrices
        if (!data) return
        const { fast, fastWait, average, avgWait, safeLow, safeLowWait } = data
        this.gasPrices = {
          fast: fast / 10,
          average: average / 10,
          safeLow: safeLow / 10,
          fastWait,
          avgWait,
          safeLowWait
        }
      } catch (err) {
        console.error(err)
        bugReporter.catchError(err)
      }
    },
    fillAmount(quota = 1) {
      this.sendForm.amount = Number(this.sendForm.wallet.balance) * quota
    },
    closeSend() {
      this.$emit('closeSend')
    },
    disableDomainAddress() {
      this.domainAddress = initData().domainAddress
    }
  }
}
</script>
