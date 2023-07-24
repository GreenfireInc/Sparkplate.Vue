<template>
  <div v-if="selectedTab">
    <!-- Doughnut Chart -->
    <metrics v-if="!portfolioView" class="metrics" :cryptos="filteredCrypto" />
    <div class="chart-wrapper">
      <doughnut-chart
        id="donutChart"
        :chart-data="dataCollection"
        :options="dataOptions"
      />
      <div id="chartjs-tooltip">
        <div>
          <p class="flex justify-center items-center font-semibold">
            {{ cntrDonutTxtLineOne }}
          </p>
          <p class="flex justify-center items-center text-lg mt-1">
            {{ cntrDonutTxtLineTwo }}
          </p>
        </div>
      </div>
    </div>

    <!-- Portfolio View -->
    <div class="container mt-10 mb-20">
      <!-- Table Header -->
      <div class="row">
        <span class="col-1 ml-3 text-lg font-semibold">#</span>
        <span class="col-1 text-lg font-semibold">Coin</span>
        <span class="col-2 text-lg font-semibold">Name</span>
        <span class="col-1 text-lg font-semibold">Ticker</span>

        <!-- Portfolio View Headers -->
        <span v-if="portfolioView" class="col-2 text-lg font-semibold"
          >Price</span
        >
        <span v-if="portfolioView" class="col-2 text-lg font-semibold"
          >Balance</span
        >
        <span v-if="portfolioView" class="col-2 text-lg font-semibold"
          >Value</span
        >

        <!-- Indices View Headers -->
        <span v-if="!portfolioView" class="col-2 text-lg font-semibold"
          >Type</span
        >
        <span v-if="!portfolioView" class="col-2 text-lg font-semibold"
          >Price</span
        >
        <span v-if="!portfolioView" class="col-2 text-lg font-semibold"
          >Market Cap</span
        >
      </div>

      <!-- Divider -->
      <hr class="col w-full bg-gray-400" />

      <!-- Portfolio Table Body -->
      <template v-if="portfolioView">
        <div
          v-for="(wallet, walletKey) in getWalletData"
          :key="`wallet-${walletKey}-symbol`"
        >
          <div class="row py-2">
            <p class="col-1 ml-3">
              {{ walletKey + 1 }}
            </p>
            <div class="col-1">
              <img
                class="h-8"
                :src="`./assets/cryptoicons/${wallet.symbol.toLowerCase()}.svg`"
                :alt="wallet.symbol"
              />
            </div>
            <p
              :key="`wallet-${wallet.number}-name`"
              class="col-2"
              v-text="wallet.name"
            />
            <p
              :key="`wallet-${wallet.number}-ticker`"
              class="col-1"
              v-text="wallet.symbol"
            />
            <p
              :key="`wallet-${wallet.number}-price`"
              class="col-2"
              v-text="`${formatCurrencyWithSettings(wallet.price, 5)}`"
            />
            <p
              :key="`wallet-${wallet.number}-balance`"
              class="col-2"
              v-text="wallet.balance.toFixed(8)"
            />
            <p
              :key="`wallet-${wallet.number}-value`"
              class="col-2"
              v-text="`${formatCurrencyWithSettings(wallet.value, 2)}`"
            />
          </div>

          <!-- Divider -->
          <hr class="col w-full bg-gray-400" />
        </div>
      </template>

      <!-- Indices Table Body -->
      <template v-else>
        <div
          v-for="(crypto, cryptoKey) in filteredCrypto"
          :key="`crypto-${cryptoKey}-symbol`"
        >
          <div class="row py-2">
            <p class="col-1 ml-3">
              {{ cryptoKey + 1 }}
            </p>
            <div class="col-1">
              <img
                class="h-8"
                :src="`./assets/cryptoicons/${crypto.symbol.toLowerCase()}.svg`"
                :alt="crypto.symbol"
              />
            </div>
            <p
              :key="`crypto-${crypto.symbol}-name`"
              class="col-2"
              v-text="crypto.name"
            />
            <p
              :key="`crypto-${crypto.symbol}-ticker`"
              class="col-1"
              v-text="crypto.symbol"
            />
            <p
              :key="`crypto-${crypto.symbol}-type`"
              class="col-2"
              v-text="crypto.category.toUpperCase()"
            />
            <p
              :key="`crypto-${crypto.symbol}-price`"
              class="col-2"
              v-text="
                `${formatCurrencyWithSettings(
                  crypto.quote[userCurrency].price,
                  5
                )}`
              "
            />
            <p
              :key="`crypto-${crypto.symbol}-cap`"
              class="col-2"
              v-text="
                `${formatCurrencyWithSettings(
                  crypto.quote[userCurrency].market_cap,
                  2
                )}`
              "
            />
          </div>

          <!-- Divider -->
          <hr class="col w-full bg-gray-400" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import DoughnutChart from '@/components/home/DoughnutChart.vue'
import Metrics from './Metrics.vue'

export default {
  name: 'HomeIndex',
  components: { DoughnutChart, Metrics },
  props: ['selectedTab'],
  data() {
    return {
      dataCollection: null,
      dataOptions: null,
      filterCoinTabArr: null,
      cntrDonutTxtLineOne: null,
      cntrDonutTxtLineTwo: null,
      coinInfoSymbol: null,
      wallets: null,
      walletData: null,
      loader: null
    }
  },
  computed: {
    ...mapState(['coinsInfo']),
    user() {
      const activeUser = this.$store.state.accounts.active
      return JSON.parse(JSON.stringify(activeUser))
    },
    userSettings() {
      return this.$store.state.userSettings
    },
    portfolioView() {
      return this.selectedTab === 'portfolio'
    },
    allWallets() {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      // need to rewrite for loops to get this to work
      return [...this.$store.getters.allWallets]
    },
    getCoinBySymbol() {
      return this.filteredCrypto.find(
        (coin) => coin.symbol === this.coinInfoSymbol
      )
    },
    getWalletData() {
      const walletsObj = this.$store.state.wallets // all wallets in state
      var walletsData = []
      var walletRowNumber = 1
      Object.keys(walletsObj).forEach((crypto) => {
        // ignore disabled currencies and cryptos with no generated wallets
        if (
          !this.userSettings.visibilityToggles[crypto] ||
          !walletsObj[crypto].length
        )
          return

        // get metadata for crypto
        const cryptoInfo = this.filteredCrypto.find(
          (coin) => coin.symbol === crypto.toUpperCase()
        )
        if (cryptoInfo && cryptoInfo.quote) {
          // get sum of all wallets for that crypto
          const sum = walletsObj[crypto].reduce(
            (sum, wallet) => sum + wallet.balance,
            0
          )

          if (sum) {
            const portfolioRow = {
              number: walletRowNumber,
              name: cryptoInfo.name,
              balance: sum,
              value: cryptoInfo.quote[this.userCurrency].price * sum,
              symbol: crypto.toUpperCase(),
              price: cryptoInfo.quote[this.userCurrency].price
            }

            // add row to data and increment row number
            walletsData.push(portfolioRow)
            ++walletRowNumber
          }
        }
      })
      return walletsData
    },
    walletSymbols() {
      // NOTE: allWallets does not work here
      const walletsSymbols = this.$store.state.wallets
      var walletsSymbolsArr = []
      Object.keys(walletsSymbols).forEach((crypto) => {
        walletsSymbols[crypto].forEach((wallet) => {
          if (wallet.balance >= 0) {
            walletsSymbolsArr.push(crypto.toUpperCase())
          }
        })
      })
      return walletsSymbolsArr
    },
    filteredCrypto: function () {
      if (!this.coinsInfo.length) return []
      var filteredCoinArr = []
      var filterCoinTabArr = []
      if (this.selectedTab === 'portfolio') {
        filterCoinTabArr = this.walletSymbols
      } else if (this.selectedTab === 'poS') {
        // Should filterCoinTabArr still be set at class level?
        filterCoinTabArr = ['ALGO', 'ADA', 'CELO', 'ATOM', 'DOT', 'SOL', 'XTZ']
      } else if (this.selectedTab === 'poW') {
        filterCoinTabArr = [
          'BTC',
          'BCH',
          'BSC',
          'DOGE',
          'ETH',
          'ETC',
          'LTC',
          'NKN',
          'ZEC'
        ]
      } else if (this.selectedTab === 'coinbase (NY)') {
        filterCoinTabArr = [
          'ZRX',
          'AAVE',
          'ALGO',
          'AMP',
          'ANKR',
          'BAL',
          'BNT',
          'BAND',
          'BOND',
          'BAT',
          'BTC',
          'BCH',
          'ADA',
          'CELO',
          'LINK',
          'CVC',
          'COMP',
          'ATOM',
          'CRV',
          'DAI',
          'MANA',
          'DOGE',
          'MLN',
          'ETH',
          'ETC',
          'FIL',
          'GRT',
          'RLC',
          'ICP',
          'KEEP',
          'KNC',
          'LTC',
          'LRC',
          'MKR',
          'MIR',
          'NKN',
          'NU',
          'NMR',
          'OMG',
          'OXT',
          'OGN',
          'DOT',
          'MATIC',
          'RLY',
          'REN',
          'SKL',
          'SOL',
          'XLM',
          'SNX',
          'UMA',
          'UNI',
          'USDC',
          'WBTC',
          'XRP',
          'YFI',
          'ZEC',
          'FET',
          'AXS',
          'FARM',
          'PLA',
          'POLY',
          'QNT',
          'RLY',
          'REQ'
        ]
      } else if (this.selectedTab === 'gemini (NY)') {
        filterCoinTabArr = [
          'ZRX',
          '1INCH',
          'AAVE',
          'ALCX',
          'AMP',
          'ANKR',
          'BAL',
          'BOND',
          'BAT',
          'BTC',
          'BCH',
          'LINK',
          'COMP',
          'CTX',
          'CRV',
          'DAI',
          'MANA',
          'DOGE',
          'ENJ',
          'ETH',
          'FTM',
          'FIL',
          'GUSD',
          'GRT',
          'INJ',
          'KNC',
          'LTC',
          'LPT',
          'LRC',
          'MKR',
          'OXT',
          'PAXG',
          'MATIC',
          'REN',
          'SAND',
          'SKL',
          'CUBE',
          'STORJ',
          'SUSHI',
          'SNX',
          'UMA',
          'UNI',
          'UST',
          'YFI',
          'ZEC',
          'MIR',
          'XTZ'
        ]
      } else if (this.selectedTab === 'storage') {
        // NOTE: DADI symbol not coming through
        filterCoinTabArr = [
          'FIL',
          'BTT',
          'HOT',
          'SC',
          'AR',
          'MAID',
          'STORJ',
          'REP',
          'OCEAN',
          'AKT',
          'PAC',
          'HNS',
          'BLZ',
          'SOUL',
          'SKY',
          'ZCN',
          'ALEPH',
          'OPCT',
          'XPX',
          'TFT',
          'SCP',
          'SIN',
          'INXT',
          'CLS',
          'TAP',
          'SS',
          'KFX',
          'SSS',
          'SRX',
          'FOL',
          'STAR',
          'SHIFT',
          'DAT'
        ]
      }
      this.coinsInfo.forEach((coin) => {
        if (filterCoinTabArr.includes(coin.symbol)) {
          filteredCoinArr.push(coin)
        }
      })
      return filteredCoinArr
    }
  },
  methods: {
    ...mapActions(['fetchCoinsInfo']),
    getCoinForPortfolio(coinSymbol) {
      return this.filteredCrypto.find((coin) => coin.symbol === coinSymbol)
    },
    getTotalWalletAssets() {
      var allWalletData = this.getWalletData
      var walletAssets = []
      var assetSum = 0
      var totalAssetsWithBalance = 0
      allWalletData.forEach((wallet) => {
        // wallet.value should be float and will be set to user currency value when displayed
        assetSum += wallet.value
        if (wallet.value > 0) {
          ++totalAssetsWithBalance
        }
      })
      walletAssets.sum = assetSum
      walletAssets.total = totalAssetsWithBalance
      return walletAssets
    },
    setCenterDonutText(cntrLineOne, cntrLineTwo) {
      this.cntrDonutTxtLineOne = cntrLineOne
      this.cntrDonutTxtLineTwo = cntrLineTwo
    },
    filterCoinsByTab(filterArray, filteredCoinArr) {
      this.coinsInfo.forEach((coin) => {
        if (filterArray.includes(coin.symbol)) {
          filteredCoinArr.push(coin)
        }
      })
      return filteredCoinArr
    },
    getWalletBySymbol(wallet, walletSymbol) {
      var foundWallet = []
      wallet.forEach((wallet) => {
        if (wallet.symbol === walletSymbol) {
          foundWallet.push(wallet)
        }
      })
      return foundWallet
    },
    fillDonutData() {
      var donutCoinData = this.filteredCrypto
      var walletDonutData = this.getWalletData
      var userCur = this.userCurrency
      // parse values for dougnut
      var tabValues = []
      // using null to init so sum calculates correctly
      var sum = null
      var coinLength = donutCoinData.length
      var labelArr = []
      var labelBKColorArr = []
      var labelHoverColorArr = []
      var labelCoinCapArr = []
      // https://htmlcolorcodes.com/
      const labelColor = [
        '#CD5C5C',
        '#F08080',
        '#FA8072',
        '#FFA07A',
        '#DFFF00',
        '#FFBF00',
        '#FF7F50',
        '#6495ED',
        '#DE3163',
        '#9FE2BF',
        '#40E0D0',
        '#CCCCFF',
        '#FF00FF',
        '#800080',
        '#808080',
        '#FF0000',
        '#800000',
        '#FF5733',
        '#808000',
        '#00FF00',
        '#008000',
        '#00FFFF',
        '#008080',
        '#0000FF',
        '#000080'
      ]
      if (this.selectedTab === 'portfolio') {
        walletDonutData.forEach(function (wallet) {
          var randomColorPortfolio = Math.floor(Math.random() * 25)
          labelArr.push(wallet.symbol)
          labelHoverColorArr.push('yellow')
          labelBKColorArr.push(labelColor[randomColorPortfolio])
          labelCoinCapArr.push(wallet.value)
        })
      } else {
        // NOTE: using forEach without for loop integer as this was creating issues with mounted and watch
        // Put any foreach loops into their own methods to clean up code flow
        donutCoinData.forEach(function (item) {
          var randomColorCoin = Math.floor(Math.random() * 25)
          var coinMarketCap = parseInt(item.quote[userCur].market_cap)
          labelArr.push(item.symbol)
          labelHoverColorArr.push('yellow')
          // NOTE: Each Coin Label will be set to the coins market cap
          var coinCap = item.quote[userCur].market_cap
          var parseCapValue = parseFloat(coinCap).toFixed(2)
          // NOTE: dollar sign or currency symbol will break doughnut label (will not load)
          // passing on parsed numeric value without any currency formatting or commas
          // see if donut values can eventually support currency signs and commas
          labelCoinCapArr.push(parseCapValue)
          labelBKColorArr.push(labelColor[randomColorCoin])
          if (coinMarketCap) {
            // float values will be removed with parseInt
            sum += parseInt(coinMarketCap)
          }
        })
      }
      // NOTE array values used to set donut center text
      // centerTextValue will be passed back in with ipcRenderer
      // and set original values
      if (this.selectedTab === 'portfolio') {
        var walletAssets = this.getTotalWalletAssets()
        tabValues.sum = this.formatCurrencyWithSettings(walletAssets.sum, 2)
        tabValues.totalAssets = walletAssets.total + ' Assets'
      } else {
        tabValues.sum = this.formatCurrencyWithSettings(sum, 2)
        tabValues.totalAssets = coinLength + ' Assets'
      }
      var centerTextValue = tabValues.sum + '|' + tabValues.totalAssets
      this.setCenterDonutText(tabValues.sum, tabValues.totalAssets)
      this.dataCollection = {
        labels: labelArr,
        datasets: [
          {
            borderWidth: 2,
            borderColor: 'black',
            backgroundColor: labelBKColorArr,
            hoverBackgroundColor: labelHoverColorArr,
            data: labelCoinCapArr
          }
        ]
      }
      this.dataOptions = {
        legend: {
          display: false
        },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        hover: {
          mode: 'nearest',
          intersect: true,
          onHover: function (e, item) {
            if (item.length) {
              // NOTE: donut bar will be set to each coin market cap
              // when user hovers then Coin Name and Price will be set in Donut Center Text
              // const data = item[0]._chart.config.data.datasets[0].data[item[0]._index]
              // Send Coin Symbol only and then fetch price for center text with ipcRenderer in mounted
              var hoveredCoinSymbol = item[0]._view.label
              window.ipcRenderer.send('updateDonutCenter', hoveredCoinSymbol)
            }
          }
        },
        elements: {
          center: {
            text: centerTextValue,
            color: '#FFF',
            fontStyle: 'Arial',
            sizePadding: 20,
            minFontSize: 25,
            lineHeight: 25
          }
        },
        deep: true,
        responsive: true,
        maintainAspectRatio: true,
        cutoutPercentage: 95,
        borderAlign: 'inner',
        animation: {
          animationRotate: true,
          duration: 2000
        },
        tooltips: {
          enabled: true,
          events: ['mouseout']
        }
      }
      // return this.dataCollection
    }
  },
  watch: {
    selectedTab(newVal) {
      if (newVal === null) {
        // trap for null
        this.fillDonutData()
      } else {
        this.fillDonutData()
      }

      // When indicies are viewed, capture analytic data
      if (!this.portfolioView) {
        const view = newVal
        this.$gtag.pageview({ page_title: `Home - ${view}` })
      }
    },
    getWalletData() {
      // NOTE: this method gets called at mount and when wallet balances are imported through walletModule.js interval
      this.fillDonutData()
    }
  },
  async created() {
    this.loader = this.$loader()
    // tracing how fetchCoinsInfo brings in data, issue with how fillDonutData is getting coin data
    // fetchCoinsInfo moved earlier in the execution chain with the call here (async created)
    await this.fetchCoinsInfo()
    // init call to fillDonutData is still slightly delayed but does eventually fill donut chart
    // need to clean up loading process to eliminate delay, coin market cap api call is slow, also wallet data is being brought in
    // Also all other calls to fillDonutData are handled by watch on this.selectedTab
    this.fillDonutData()
  },
  mounted() {
    // NOTE: see if wallets can be used where wallet data is needed
    this.wallets = this.$store.state.wallets
    // fill data for Donut Chart
    this.fillDonutData()
    // testing bringing in all wallet data here and using in relative functions when needed
    // NOTE: make sure updated balances are coming through
    // this.wallets = this.allWallets
    // Look into setting up getter filters on walletData
    this.walletData = this.getWalletData
    // NOTE: When developing code and making saves an event emitter error occurs and breaks the execution of the below ipcRenderer calls
    // In addition it looks like only Portfolio coins (wallet) are in the array value labels for all other Tab sections
    // So something is breaking related to the intial load of the app while developing, look into an event bus to replace ipcRenderer
    // https://github.com/scottcorgan/tiny-emitter
    window.ipcRenderer.on('updateDonutCenter', (data) => {
      if (data === 'total') {
        // get into array and set total and asset variables
        var dataOptionsCtrTxt = this.dataOptions.elements.center.text
        var centerTxtArr = dataOptionsCtrTxt.split('|')
        this.setCenterDonutText(centerTxtArr[0], centerTxtArr[1])
      } else {
        // NOTE this will need to set the Price for the coin that is being hovered over
        // Price data will not be in chartData, so call a method that returns Price by coin symbol
        this.coinInfoSymbol = data
        if (this.selectedTab === 'portfolio') {
          // special case for portfolio, get wallet information pertaining to data symbol passed here
          var ipcWalletData = this.getWalletData
          var walletSelected = this.getWalletBySymbol(ipcWalletData, data)
          this.setCenterDonutText(
            data,
            this.formatCurrencyWithSettings(walletSelected[0].value, 2)
          )
        } else {
          var coinInfoForCenter = this.getCoinBySymbol
          var coinPrice = this.formatCurrencyWithSettings(
            coinInfoForCenter.quote[this.userCurrency].price,
            2
          )
          this.setCenterDonutText(data, coinPrice)
        }
      }
    })
    this.loader.hide()
  }
}
</script>

<style lang="scss" scoped>
.chart-wrapper {
  max-height: 450px;
  position: relative;
  // margin-top: 10px;
  margin: auto;
  padding: 25px;
  width: 450px;
  // background-color: #1b1e21;
  // background-color: #fff;
  // box-shadow: 3px 7px #f2f3f4 ;

  #donutChart {
    position: relative;
    z-index: 10;
  }
  #chartjs-tooltip {
    left: 0;
    top: 0;
    font-family: Arial, sans-serif;
    font-style: normal;
    right: 0;
    display: flex;
    justify-content: center;
    position: absolute;
    z-index: 0;
    height: 100%;
    padding: 0;
    opacity: 1 !important;
    align-items: center;
    color: #000;
    font-size: 20px !important;
    font-weight: 800 !important;
  }
}
.metrics {
  position: relative;
  top: 0;
  right: 1rem;
}
</style>
