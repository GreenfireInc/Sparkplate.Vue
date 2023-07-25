import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import cc from 'currency-codes'

export default Vue.mixin({
  computed: {
    ...mapState({
      accounts: (state) => state.accounts,
      coinsInfo: (state) => state.coinsInfo,
      contacts: (state) => state.contacts.list
    }),
    loggedIn() {
      return Boolean(this.$store.state.accounts.active)
    },
    loggedUserData() {
      const activeUser = this.accounts.active
      return JSON.parse(JSON.stringify(activeUser))
    },
    userCurrency() {
      const currency = this.loggedUserData.globalCurrency
        ? this.loggedUserData.globalCurrency
        : this.loggedUserData.currency
      return currency
    }
  },
  methods: {
    currencyToGlobalValue(balance, currency) {
      if (currency.toLowerCase() === 'tst') return 0
      const crypto = this.coinsInfo.find(
        (coin) => coin.symbol === currency.toUpperCase()
      )
      return crypto.quote[this.userCurrency].price * balance
    },
    formatDate(date) {
      const dateToFormat = moment(date)
      // We can pass in the date of each item to be formatted for the card.
      const formatted = dateToFormat.format('MMM Do YYYY h:mm:ss a')
      return formatted
    },
    formatFigure(figure) {
      if (!figure) return ''
      return figure.toLocaleString()
    },
    formatCurrencyWithSettings(value, fixedValue) {
      // NOTE: integers and float values could be passed here, check integers passed
      // NOTE see if original formatCurrency based on country-currency-map import is still needed or remove
      // NOTE: verify loggedUserData.currency is bringing in setting set in User Profile Settings
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.userCurrency,
        minimumFractionDigits: fixedValue
      }).format(value)
    },
    formatNum(num, points = 4) {
      if (!num) return 0

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: points
      })
        .format(num)
        .replace('$', '')
    },
    formatMenuLabel(label) {
      const re = /[-]+/g
      const formatted = label.replace(re, ' ')
      const firstLetter = formatted.charAt(0)
      const remainder = formatted.slice(1)
      return firstLetter.toUpperCase() + remainder
    },
    getDisplayCurrencyFormat(code) {
      let currencyName
      if (this.globalCurrencyIsFiat) {
        currencyName = cc.code(code).currency
      } else {
        currencyName = this.$store.state.coinsMeta[code.toUpperCase()].name
      }
      return `${currencyName} (${code})`
    },
    async onFileDrag(promise) {
      try {
        const { content } = await promise
        this.qrParser(content)
      } catch (error) {
        this.invalidQRToast()
      }
    },
    onDragOver(isDraggingOver) {
      this.dragover = isDraggingOver
    },
    async onQrInit(promise) {
      this.qrLoading = true
      try {
        await promise
      } catch (error) {
        // console.log('** onQrInit catch error', error)
        console.error(error)
      } finally {
        this.qrLoading = false
      }
    },
    onQrDecode(data) {
      this.qrParser(data)
      this.qrCameraModalOpen = !this.qrCameraModalOpen
      this.qrLoading = true
    },
    convertCurrency(currency) {
      console.log('** mixins.js convertCurrency currency>>', currency)
      if (this.loggedUserData) {
        currency = currency.toUpperCase()
        let fiatPrice = 0

        for (let i = 0; i < this.coinsInfo.length; i++) {
          if (this.coinsInfo[i].symbol === currency) {
            fiatPrice = JSON.parse(
              JSON.stringify(this.coinsInfo[i].quote[this.userCurrency].price)
            )
            break
          }
        }

        return fiatPrice
      } else return 0
    },
    handleNumInput(e) {
      const charCode = String.fromCharCode(e.keyCode)
      if (!/[0-9]|\./.test(charCode)) {
        e.preventDefault()
      }
    }
  }
})
