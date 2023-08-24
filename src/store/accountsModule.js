/*
 * Contributors: Aciel Ochoa
 *
 * Description: Vuex module for handling user account state
 *
 */

import { UserService } from '../service/UserService'
import { HDWalletService } from '../service/HDWalletService'
import csc from 'country-state-city'
import cypher from '@/service/Cypher'
import { getCountry } from 'country-currency-map'

const userService = new UserService()

const initState = () => ({
  active: null,
  all: [],
  status: {},
  hdWallet: {},
  authenticated: false,
  ip: ''
})

export default {
  namespaced: true,
  state: initState,
  mutations: {
    setHDWallet(state, hdWallet) {
      state.hdWallet = hdWallet
    },
    addUser(state, info) {
      state.all.push(info)
    },
    updateProfile(state, user) {
      state.all.forEach((element, i) => {
        if (element !== null && element.id === user.id) {
          state.all[i] = user
        }
      })
      // Update active user when profile is updated
      for (const key in user) {
        state.active[key] = user[key]
      }
    },
    setCurrentUser(state, info) {
      state.active = info
    },
    setActionStatus(state, { text, type, timeout }) {
      state.status = {
        text,
        type
      }

      setTimeout(() => {
        state.status = {}
      }, timeout || 4000)
    },
    setAuthenticated(state, value) {
      state.authenticated = value
    },
    resetAccountState(state) {
      Object.assign(state, initState())
    }
  },
  actions: {
    async signup({ commit, dispatch }, userData) {
      const { firstname, lastname, email, password, mnemonic } = userData
      cypher.setEncryptionKey(password)
      // Create HDWallet && Signature for User
      const hdWallet = new HDWalletService(mnemonic, email, password, firstname)
      const signature = `${firstname} ${lastname}`

      // Retrieve IP, country, and currency of User
      const ip = await dispatch('fetchIP')
      const geo = await window.geoip.lookup(ip)
      const cscData = csc.getCountryByCode(geo.country)
      const { id: country, name: countryName } = cscData
      const { currency } = getCountry(countryName)

      // Create User account
      const data = {
        firstname,
        lastname,
        email,
        password,
        country,
        currency,
        addressBookToggle: true,
        annotationsTogle: true,
        mnemonic: mnemonic.phrase,
        signatureStyle: 'cursive_1'
      }
      const user = await userService.addUser(data)

      if (user != null) {
        commit('addUser', { ...user })
        commit('setCurrentUser', {
          ...user,
          signature,
          loggedIn: Date.now()
        })
        commit('setHDWallet', hdWallet)
        dispatch('initUserData', user.id)
        commit('setAuthenticated', true)
      }

      if (userData.generateWallets) {
        dispatch('wallets/generateInitialWallets', user.id, { root: true })
      }
    },
    async login({ commit, dispatch }, { form, requireMFA }) {
      const { email, password } = form

      // Set user's password as encryption key for sensitive database columns
      cypher.setEncryptionKey(password)

      // Validate and retrieve user data
      const user = await userService.login({ email, password })
      if (!user) {
        commit('setActionStatus', {
          text: 'Incorrect credentials!',
          type: 'error'
        })
        return
      }
      commit('setCurrentUser', {
        ...user,
        signature: `${user.firstname} ${user.lastname}`,
        loggedIn: Date.now()
      })

      // Create and set HD Wallet
      const mnemonic = await window.cryptos.generateMnemonic(user.mnemonic)
      const hdWallet = new HDWalletService(mnemonic, user.email)
      commit('setHDWallet', hdWallet)

      // Load user data to state
      const settled = await dispatch('initUserData', user.id)
      const userSettings = settled[0].value
      // Finalize authentication
      if (userSettings.mfaEnabled && userSettings.mfaRequireOnLogin) {
        requireMFA()
      } else dispatch('setAuthenticated', true)
    },
    setAuthenticated({ rootState, commit }, payload) {
      // NOTE: Still seeing issue where bugTrackingStatus is not returning true after Sign Up
      commit('setAuthenticated', payload)
      const bugTrackingStatus = rootState.userSettings.bugTrackingEnabled
      window.ipcRenderer.send('setBugTracking', bugTrackingStatus)
      // Fall back to using local storage if ipc calls do not work
      // localStorage.setItem('bug_tracking', bugTrackingStatus)
      window.ipcRenderer.send(
        'setAppCloseToTray',
        rootState.userSettings.appToTrayEnabled
      )
    },
    logout({ commit, dispatch, rootState }) {
      const userId = rootState.accounts.active.id
      // record when user logs out
      try {
        dispatch(
          'activities/addLoginActivity',
          { activityCategory: 'logout', date: new Date(), userId: userId },
          { root: true }
        )
      } catch (error) {
        // add bug reporting call here
        console.log(error)
      }
      // RESET ALL STATE ON LOGOUT
      commit('resetAccountState')
      commit('userSettings/resetSettingsState', null, { root: true })
      commit('wallets/resetWalletsState', null, { root: true })
      commit('contacts/resetContactsState', null, { root: true })
      commit('activities/resetActivitiesState', null, { root: true })
      dispatch('web3Connections/performLogout', null, { root: true })
    },
    updateUser({ commit }, user) {
      userService.updateUserById(user)
      commit('updateProfile', user)
    },
    async resetPassword({ state, commit }, password) {
      const { id, mnemonic, email, firstname } = state.active
      await cypher.updateEncryptionKey({ key: password, userId: id })
      userService.updateUserPassword(id, password)
      const hdWallet = new HDWalletService(mnemonic, email, password, firstname)
      commit('setHDWallet', hdWallet)
    },
    initUserData({ dispatch }, id) {
      const promises = [
        dispatch('userSettings/loadSettings', id, { root: true }),
        dispatch('wallets/fetchDBWallets', id, { root: true }),
        dispatch('contacts/loadContacts', id, { root: true })
      ]
      return Promise.allSettled(promises)
    },
    async fetchIP({ state }) {
      if (state.ip) return state.ip
      else {
        try {
          const res = await fetch('https://jsonip.com', { mode: 'cors' })
          const { ip } = await res.json()
          state.ip = ip
          return ip
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
}
