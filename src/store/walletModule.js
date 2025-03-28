import { WalletService } from '../service/WalletService'
import bugReporter from '../logging/BugReporter'
import { walletList } from '@/config/walletListConfig'
import helpers from '../utils/helper'
import { blockchairCryptos } from '@/config/apisConfig'

const walletService = new WalletService()

const initState = () => {
  const data = {}
  Object.keys(walletList).forEach((coinTicker) => {
    data[coinTicker] = []
  })
  return data
}

export default {
  namespaced: true,
  state: initState,
  mutations: {
    addWallet(state, { crypto, wallet }) {
      const c = crypto.toLowerCase()
      if (!wallet) return
      state[c] = [
        {
          ...wallet
        },
        ...state[c]
      ]
    },
    removeWallet(state, { crypto, index }) {
      state[crypto].splice(index, 1)
    },
    updateWallet(state, wallet) {
      const { coinTicker, balance } = wallet
      state[coinTicker.toLowerCase()] = state[coinTicker.toLowerCase()].map(
        (entry) => {
          if (wallet.address === entry.address) entry.balance = balance
          return entry
        }
      )
    },
    changeNickname(state, { crypto, index, nickname }) {
      state[crypto][index].nickname = nickname
    },
    resetWalletsState(state) {
      Object.assign(state, initState())
    }
  },
  actions: {
    async addWalletToDB(
      { rootState },
      { crypto, wallet, isHDWallet, activityCategory }
    ) {
      const { id } = rootState.accounts.active
      return walletService.addWallet({
        date: new Date(),
        coinTicker: crypto.toUpperCase(),
        isHDWallet,
        derivationPath:
          wallet.derivationPath ||
          'Derivation Path Not Privided in Wallet Object',
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        wif: wallet.wif,
        address: wallet.address,
        balance: parseFloat(wallet.balance),
        userId: id,
        activityCategory
      })
    },
    async updateWallet({ commit }, wallet) {
      const updated = await walletService.updateWallet(wallet)
      if (updated) commit('updateWallet', wallet)
    },
    async updateBalance({ dispatch, rootState }, { wallet, amount }) {
      const parsedAmount = parseFloat(amount)
      // If amount recieved and is different from stored balance
      if (parseFloat(wallet.balance) !== parsedAmount && !isNaN(parsedAmount)) {
        // Update wallet
        dispatch('updateWallet', { ...wallet, balance: parsedAmount })
        // Check if user has notificationsEnabled and create new Notification
        if (rootState.userSettings.notificationsEnabled) {
          const options = {
            title: `${wallet.coinTicker.toUpperCase()} Balance Updated!`,
            body: `${
              wallet.nickname ? wallet.nickname : wallet.address
            } balance update to ${amount}.`,
            silent: false,
            timeoutType: 'never',
            urgency: 'critical',
            closeButtonText: 'Close Button',
            actions: [
              {
                type: 'button',
                text: 'Show Button'
              }
            ]
          }
          window.notification.newNotification(options)
        }
      }
    },
    async generateWallet({ commit, rootState, dispatch }, coinTicker) {
      const { hdWallet } = rootState.accounts
      const network =
        rootState.userSettings.networkSelection[coinTicker.toLowerCase()]
      const wallet = await hdWallet.generateWallet({ coinTicker, network })
      if (wallet.address || wallet.accountId) {
        const [savedWallet] = await dispatch('addWalletToDB', {
          wallet,
          isHDWallet: true,
          crypto: coinTicker,
          activityCategory: 'wallet-generated'
        })
        commit('addWallet', { crypto: coinTicker, wallet: savedWallet })
      }
    },
    async generateBasicWallet({ rootState, commit, dispatch }, crypto) {
      const network =
        rootState.userSettings.networkSelection[crypto.toLowerCase()]
      const wallet = await window.cryptos.generateBasicWallet({
        coinTicker: crypto,
        network
      })
      if (wallet.address || wallet.accountId) {
        const [savedWallet] = await dispatch('addWalletToDB', {
          wallet,
          isHDWallet: false,
          crypto,
          activityCategory: 'wallet-generated'
        })
        if (savedWallet) commit('addWallet', { crypto, wallet: savedWallet })
        return savedWallet
      }
    },
    async linkERC20Wallet({ commit, dispatch }, { coinTicker, wallet }) {
      const erc20Wallet = { ...wallet, coinTicker, balance: 0 }
      const payload = {
        wallet: erc20Wallet,
        crypto: coinTicker,
        activityCategory: 'wallet-erc20-linked',
        isHDWallet: wallet.isHDWallet
      }
      const [addedWallet] = await dispatch('addWalletToDB', payload)
      commit('addWallet', { crypto: coinTicker, wallet: addedWallet })
    },
    async removeWallet({ commit, state }, { crypto, index }) {
      const walletId = state[crypto][index].id
      await walletService.removeWallets(walletId)
      commit('removeWallet', { crypto, index })
    },
    async fetchDBWallets({ commit }, id) {
      try {
        const userWallets = await walletService.getWallets(id)
        if (userWallets.length) {
          userWallets.forEach((wallet) => {
            commit('addWallet', {
              crypto: wallet.coinTicker,
              wallet
            })
          })
        }
      } catch (err) {
        console.log(err)
        bugReporter.catchError(err)
      }
    },

    async changeNickname({ commit, state }, { crypto, index, nickname }) {
      const walletId = state[crypto][index].id
      await walletService.updateNickname(walletId, nickname)
      commit('changeNickname', { crypto, index, nickname })
    },
    async importWallet({ rootState, commit, dispatch }, payload) {
      const { coinTicker, privateKey, wif } = payload
      if (!privateKey && !wif)
        throw new Error('Must provide privateKey or wif to import wallet.')

      // Get cryptoLib using blockchain platform for coin
      const coinConfig = walletList[coinTicker]
      const isToken = coinConfig.coinType === 'token'
      const blockchain = isToken
        ? coinConfig.platform.blockchain
        : coinTicker.toLowerCase()

      // Use crypto lib to import wallet, then add to database
      const network =
        rootState.userSettings.networkSelection[coinTicker.toLowerCase()]
      const wallet = await window.cryptos.importWallet({
        coinTicker: blockchain,
        privateKey,
        wif,
        network
      })
      const [saved] = await dispatch('addWalletToDB', {
        crypto: coinTicker,
        wallet,
        isHDWallet: false,
        activityCategory: 'wallet-imported'
      })
      if (saved) {
        commit('addWallet', {
          crypto: coinTicker.toLowerCase(),
          wallet: saved
        })
        return saved
      }
    },
    async importWalletWithKey({ dispatch }, formContent) {
      // For importing Wallets by Private Key or Hex based on formContent
      const { crypto, exportWalletObj } = formContent
      return dispatch('importWallet', {
        ...exportWalletObj,
        coinTicker: crypto
      })
    },
    async importFromJSON({ dispatch }, coinTicker) {
      const fileContent = await helpers.fetchJSONfile()
      if (!fileContent || !Object.keys(fileContent).length) return
      const payload = {
        ...fileContent,
        coinTicker
      }
      return dispatch('importWallet', payload)
    },
    async importWalletQr({ dispatch }, qrContent) {
      const { crypto, exportWalletObj } = qrContent
      return dispatch('importWallet', {
        ...exportWalletObj,
        coinTicker: crypto
      })
    },
    async exportWallet({ rootState }, { crypto, walletData }) {
      const { wif, privateKey } = walletData
      const user = rootState.accounts.active
      const username = user.firstname + user.lastname
      const filename = `${username}.${crypto.toLowerCase()}.${
        walletData.address
      }`
      return helpers.createJSONfile({ wif, privateKey }, filename)
    },
    getBalances({ dispatch, state, rootState }) {
      Object.keys(state).forEach(async (crypto) => {
        // Skip balance check for disabled cryptos and cryptos without any wallets
        const wallets = state[crypto]
        const isVisible =
          rootState.userSettings.visibilityToggles[crypto.toLowerCase()]
        if (!isVisible || !wallets.length) return

        try {
          const network =
            rootState.userSettings.networkSelection[crypto.toLowerCase()]

          if (blockchairCryptos.has(crypto.toLowerCase())) {
            // Bulk request data for blockchairCryptos
            const addresses = wallets.map((wallet) => wallet.address)
            const balances = await window.cryptos.getBalances({
              addresses,
              crypto,
              network
            })
            wallets.forEach((wallet) => {
              const amount = balances[wallet.address]
              dispatch('updateBalance', { wallet, amount })
            })
          } else {
            // Iterate over all addresses and request balances
            wallets.forEach(async (wallet) => {
              if (wallet.address || wallet.accountId) {
                const amount = await window.cryptos.getBalance({
                  wallet,
                  network
                })
                dispatch('updateBalance', { wallet, amount })
              }
            })
          }
        } catch (err) {
          console.error(err.message)
          bugReporter.catchError(err)
        }
      })
    },
    async generateInitialWallets({ dispatch, state, rootState }) {
      const generate = async (coinTicker) => {
        for (let i = 0; i < 3; i++) {
          try {
            await dispatch('generateWallet', coinTicker)
          } catch (err) {
            console.log(err)
            bugReporter.catchError(err)
          }
        }
      }

      Object.keys(state).forEach((coinTicker) => {
        const tokenVisibility =
          rootState.userSettings.visibilityToggles[coinTicker.toLowerCase()]
        if (tokenVisibility) generate(coinTicker)
      })
    },
    sendToAddress({ rootState }, { wallet, toAddress, amount, fee, gasPrice }) {
      const coinTicker = wallet.coinTicker.toLowerCase()
      const network = rootState.userSettings.networkSelection[coinTicker]
      return window.cryptos.sendToAddress({
        wallet,
        toAddress,
        amount,
        gasPrice,
        fee,
        network
      })
    }
  },
  getters: {
    totalAssetsValue(_, __, rootState, rootGetters) {
      if (!rootState.coinsInfo.length) return 0
      // First two parameters (state, getters) are unused
      const user = rootState.accounts.active
      const userCurrency = user.globalCurrency
        ? user.globalCurrency
        : user.currency
      const cryptos = {}

      const allWallets = rootGetters.allWallets
      const totalValue = allWallets.reduce((sum, wallet) => {
        let crypto = cryptos[wallet.coinTicker]
        if (!crypto) {
          crypto = rootState.coinsInfo.find(
            (coin) => coin.symbol === wallet.coinTicker.toUpperCase()
          )
        }
        if (!crypto.quote[userCurrency]) return 0

        const walletValue = crypto.quote[userCurrency].price * wallet.balance
        return sum + walletValue
      }, 0)
      return totalValue
    },
    getWalletByAddress: (state) => (coinTicker, address) => {
      coinTicker = coinTicker.toLowerCase()
      const wallets = state[coinTicker]
      if (!wallets.length) return
      if (coinTicker === 'eth') {
        const wallet = wallets.find(
          (w) => w.address.toLowerCase() === address.toLowerCase()
        )
        return wallet
      } else {
        const wallet = wallets.find((w) => w.address === address)
        return wallet
      }
    }
  }
}
