/*
 * Contributors: Aciel Ochoa
 *
 * Description: Vuex module for state management of user settings
 *
 */

import { walletList } from '@/config/walletListConfig'
import SettingsService from '../service/SettingsService'
import Vue from 'vue'
const settingsService = new SettingsService()

const initialState = () => {
  // setup initial mainnet/testnet toggles
  const useMainnet = !import.meta.env.VITE_USE_TESTNET
  const networkSelection = {}

  Object.keys(walletList).forEach((coinTicker) => {
    const config = walletList[coinTicker]
    const testNetworks = config.testnets
    if (config.platform) {
      networkSelection[coinTicker] = config.platform.network
    } else if (!useMainnet && testNetworks.length) {
      networkSelection[coinTicker] = testNetworks[0]
    } else {
      networkSelection[coinTicker] = config.mainnet
    }
  })

  // setup initial visibility toggles
  const visibilityToggles = {}
  Object.keys(walletList).forEach((coinTicker) => {
    visibilityToggles[coinTicker] = walletList[coinTicker].default
  })

  return {
    mfaEnabled: false,
    mfaUseQr: false,
    mfaRequireOnLogin: false,
    mfaRequireOnDashboardSend: false,
    mfaRequireOnQuickExchange: false,
    analyticsOptIn: true, // set to false before moving to production
    toggleTimeout: true,
    toggleTimeoutValue: 360,
    remoteSending: true,
    notificationsEnabled: true,
    appToTrayEnabled: false,
    bugTrackingEnabled: false,
    networkSelection,
    visibilityToggles
  }
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    value: (state) => {
      return state.value
    }
  },
  mutations: {
    updateSetting(state, { setting, value }) {
      state[setting] = value
    },
    setEmailConfig(state, payload) {
      state.emailConfig = payload
    },
    loadSettings(state, settings) {
      for (const setting in settings) {
        state[setting] = settings[setting]
      }
    },
    resetSettingsState(state) {
      Object.assign(state, initialState())
    }
  },
  actions: {
    async loadSettings({ commit, state, rootState }, id) {
      // Attempt to load settings from database
      const userId = id || rootState.accounts.active.id
      const settings = await settingsService.getUserSettings(userId)
      if (!settings) {
        // Add default settings for user if none exist
        await settingsService.addUserSettings(userId, state)

        // OptIn/Out for analytics
        setGtagEnabled(state.analyticsOptIn)
        return state
      } else {
        const {
          emailConfigUsername,
          emailConfigPassword,
          emailConfigHost,
          emailConfigPort,
          emailConfigTls,
          ...rest
        } = settings

        // Load settings/email config to vuex state
        commit('loadSettings', rest)
        commit('setEmailConfig', {
          emailConfigUsername,
          emailConfigPassword,
          emailConfigHost,
          emailConfigPort,
          emailConfigTls
        })

        // OptIn/Out for analytics
        setGtagEnabled(rest.analyticsOptIn)

        return settings
      }
    },
    async updateSetting({ commit, rootState }, { setting, value }) {
      // Update user settings in database
      const userId = rootState.accounts.active.id
      const updatedSetting = { [setting]: value }
      const updated = await settingsService.updateUserSettings(
        userId,
        updatedSetting
      )
      // Update vuex state
      if (updated) {
        commit('updateSetting', { setting, value })
      }
    },
    async updateNetworkSelection({ dispatch, state }, { coinTicker, network }) {
      // Assign selected network to networkSelection object at coinTicker
      const setting = 'networkSelection'
      const value = { ...state[setting] }
      value[coinTicker] = network
      dispatch('updateSetting', { setting, value })
    },
    async toggleSetting({ commit, state, rootState }, setting) {
      // Update user settings in database
      const userId = rootState.accounts.active.id
      const updatedSetting = { [setting]: !state[setting] }
      const updated = await settingsService.updateUserSettings(
        userId,
        updatedSetting
      )
      // Update vuex state
      if (updated) {
        commit('updateSetting', { setting, value: !state[setting] })
      }
    },
    async updateEmailConfig({ commit, rootState }, payload) {
      const userId = rootState.accounts.active.id
      await settingsService.updateUserSettings(userId, payload)
      commit('setEmailConfig', payload)
    }
  }
}

function setGtagEnabled(enabled) {
  if (enabled) Vue.$gtag.optIn()
  else Vue.$gtag.optOut()
}
