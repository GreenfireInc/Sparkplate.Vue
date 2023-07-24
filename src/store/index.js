import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import SecureLS from 'secure-ls'
import sharedMutations from 'vuex-shared-mutations'
import walletModule from './walletModule'
import contactModule from './contactModule'
import accountsModule from './accountsModule'
import activityModule from './activityModule'
import settingsModule from './settingsModule'
import web3ConnectionModule from './web3ConnectionModule'
import {
  getCoinsData,
  getCoinsMeta,
  priceConversions,
  getGasPrices
} from '../factory'

// testing writing coin price meta info to files
const coinInfoPath = './src/assets/coininfo.json'
const coinMetaPath = './src/assets/coinmeta.json'

const ls = new SecureLS({ isCompression: false })
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    settings: {
      menuType: 'micro'
    },
    coinsInfo: {},
    coinsMeta: {},
    gasPrices: {}
  },
  mutations: {
    setMenuType(state, payload) {
      state.settings.menuType = payload
    },
    setCoinsInfo(state, payload) {
      state.coinsInfo = payload
    },
    setGasPrices(state, payload) {
      state.gasPrices = payload
    },
    setCoinsMeta(state, payload) {
      state.coinsMeta = payload
    }
  },
  actions: {
    changeMenuType({ commit }, payload) {
      commit('setMenuType', payload)
    },
    async fetchCoinsInfo({ getters, commit }) {
      try {
        // check for global currency and use it if it exists, otherwise use currency
        const userCurrency = getters.user.globalCurrency
          ? getters.user.globalCurrency
          : getters.user.currency
        // NOTE Two back to back await calls here, check code execution
        let coinsData
        let coinsMeta
        const coinInfoFileExists = await window.fs.checkFileExists(coinInfoPath)
        const coinMetaFileExists = await window.fs.checkFileExists(coinMetaPath)
        // eslint-disable-next-line
        if (
          import.meta.env.VITE_USE_STORED_COININFO &&
          coinInfoFileExists &&
          coinMetaFileExists
        ) {
          // console.log('** coin data files exist - load')
          coinsData = await loadParseJSON(coinInfoPath)
          coinsMeta = await loadParseJSON(coinMetaPath)
        } else {
          coinsMeta = await getCoinsMeta()
          coinsData = await getCoinsData(userCurrency)
          if (import.meta.env.VITE_USE_STORED_COININFO) {
            // save coin data
            const coinInfoPayload = JSON.stringify(coinsData)
            await writeCoinData(coinInfoPath, coinInfoPayload)
            const coinMetaPayload = JSON.stringify(coinsMeta)
            await writeCoinData(coinMetaPath, coinMetaPayload)
          }
        }
        const coinsInfo = Object.keys(coinsMeta).map((coin) => ({
          ...coinsMeta[coin],
          ...coinsData[coin]
        }))

        commit('setCoinsInfo', coinsInfo)
        commit('setCoinsMeta', coinsMeta)
      } catch (err) {
        console.log({ err })
      }
    },
    async fetchGasPrices({ commit }) {
      const data = await getGasPrices()
      if (!data) return
      const { fast, fastWait, average, avgWait, safeLow, safeLowWait } = data
      commit('setGasPrices', {
        fast: fast / 10,
        average: average / 10,
        safeLow: safeLow / 10,
        fastWait,
        avgWait,
        safeLowWait
      })
    },
    async gainLossCalculator(_, payload) {
      const response = await priceConversions(payload)
      return response
    }
  },
  getters: {
    menuType({ settings }) {
      return settings.menuType
    },
    env(state) {
      return state.env
    },
    user(state) {
      return state.accounts.active
    },
    marketItems(state) {
      return [].concat(
        state.solidMetals,
        state.stockPrices,
        state.itemPrices,
        state.carPrices,
        state.flightPrices
      )
    },
    coinPrices({ coinsInfo }) {
      // console.log({ coinsInfo })
      const prices = {}
      coinsInfo.forEach((coin) => {
        if (!coin || !coin.quote || !coin.quote.USD || !coin.quote.USD.price)
          return
        prices[coin.symbol] = coin.quote.USD.price
      })

      return prices
    },
    allWallets({ wallets, userSettings }) {
      // console.log('ALL WALLETS:::', wallets)
      const walletList = []
      Object.keys(wallets).forEach((coin) => {
        // Filter all wallets that are not visible on dashboard
        if (!userSettings.visibilityToggles[coin]) return

        wallets[coin].forEach((wallet) => {
          if (!wallet.address && !wallet.accountId) return

          walletList.push({
            ...wallet,
            currency: coin
          })
        })
      })

      return walletList
    }
  },
  modules: {
    accounts: accountsModule,
    wallets: walletModule,
    contacts: contactModule,
    activities: activityModule,
    userSettings: settingsModule,
    web3Connections: web3ConnectionModule
  },
  plugins: [
    createPersistedState({
      key: 'Sparkplate',
      paths: ['settings', 'coinsInfo', 'coinsMeta'],
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key)
      }
    }),
    sharedMutations({
      predicate: ['settings']
    })
  ]
})

function writeCoinData(filePath, filePayload) {
  return window.fs.writeFileSync(filePath, filePayload, 'utf8')
}

async function loadParseJSON(file) {
  const coinData = await window.fs.readFileSync(file, 'utf-8')
  const coinDataParsed = JSON.parse(coinData)
  return coinDataParsed
}
