/*
 * Contributors: Aciel Ochoa
 *
 * Description: Vuex module for handleing address book contacts state
 */
import { set } from 'vue'
import helpers from '../utils/helper'
import ContactService from '../service/ContactService'
import bugReporter from '@/logging/BugReporter'
import moment from 'moment'
const contactService = new ContactService()

const initState = () => ({
  list: []
})

export default {
  namespaced: true,
  state: initState,
  mutations: {
    addContact(state, contactInfo) {
      delete contactInfo.userId // remove userId from contact
      state.list.push({ ...contactInfo, wallets: {} })
    },
    setWalletToContact(state, _wallet) {
      const contacts = state.list
      const { contactId, ...wallet } = _wallet
      const coinTicker = wallet.coinTicker.toLowerCase()
      for (const i in contacts) {
        if (contacts[i].id === contactId) {
          if (!state.list[i].wallets[coinTicker]) {
            set(state.list[i].wallets, coinTicker, [wallet])
          } else {
            const updatedList = [wallet, ...state.list[i].wallets[coinTicker]]
            set(state.list[i].wallets, coinTicker, updatedList)
          }
          break
        }
      }
    },
    removeContact(state, id) {
      state.list = state.list.filter((contact) => contact.id !== id)
    },
    editContactById(state, info) {
      state.list = state.list.map((contact) => {
        if (contact.id === info.id) contact = info
        return contact
      })
    },
    resetContactsState(state) {
      Object.assign(state, initState())
    }
  },
  actions: {
    async insertContact({ rootState, commit }, contactInfo) {
      try {
        const userId = rootState.accounts.active.id
        const contact = await contactService.addContact(userId, contactInfo)
        commit('addContact', contact)
        return contact
      } catch (err) {
        console.error(err)
      }
    },
    async updateContact({ commit }, contactInfo) {
      const updated = await contactService.updateContactById(contactInfo)
      if (updated) commit('editContactById', contactInfo)
      return updated
    },
    async addCurrencyToContact({ commit }, { contactId, coinTicker, address }) {
      const walletExistOnContact = await doesContactCurrencyExist(
        { coinTicker, address },
        contactId
      )
      if (!walletExistOnContact) {
        const [wallet] = await contactService.addCurrencyToContact(contactId, {
          coinTicker,
          address
        })
        commit('setWalletToContact', wallet)
      } else {
        throw new Error('Public wallet address already exists on this contact.')
      }
    },
    async updateContactCurrency({ commit, state }, { currency, contactId }) {
      const walletExistOnContact = await doesContactCurrencyExist(
        currency,
        contactId
      )
      if (walletExistOnContact) {
        throw new Error('Public wallet address already exists on this contact.')
      }
      await contactService.updateContactCurrency(currency)
      // Find contact object to update
      const contact = state.list.find((c) => c.id === contactId)
      // If the coinTicker has not changed, update the wallet address
      const initialTicker = currency.initial.coinTicker
      const { coinTicker, address } = currency
      if (coinTicker === initialTicker) {
        const currencyWallets = contact.wallets[coinTicker].map((entry) => {
          if (entry.id === currency.id) {
            entry.address = address
          }
          return entry
        })
        contact.wallets[coinTicker] = currencyWallets
        commit('editContactById', contact)
      } else {
        // If coinTicker has changed, remove old entry and add new
        contact.wallets[initialTicker] = contact.wallets[initialTicker].filter(
          (entry) => entry.id !== currency.id
        )
        commit('editContactById', contact)
        const newWallet = { contactId, id: currency.id, coinTicker, address }
        commit('setWalletToContact', newWallet)
      }
    },
    async removeContactCurrency({ commit, state }, { contactId, currency }) {
      try {
        // remove contact currency entry from database
        await contactService.removeCurrencyFromContact(currency.id)
        // remove contact currency from state
        const contact = state.list.find((contact) => contact.id === contactId)
        contact.wallets[currency.coinTicker] = contact.wallets[
          currency.coinTicker
        ].filter((wallet) => wallet.id !== currency.id)
        commit('editContactById', contact)
        return 1
      } catch (err) {
        bugReporter.catchError(err)
        console.error(err)
        return 0
      }
    },
    async removeContactById({ commit }, id) {
      if (!id) return
      const deleted = await contactService.removeContact(id)
      if (deleted) {
        commit('removeContact', id)
      }
    },
    async importContacts({ dispatch }) {
      try {
        const contacts = await helpers.importFromCSV()
        if (!contacts || !contacts.length)
          throw new Error('Unable to parse CSV file.')

        contacts.forEach(async (contact) => {
          // Add Contact if does not exist
          const data = await dispatch('insertContact', contact)

          // Parse Wallets Data and Add to DB
          contact.wallets.split(',').forEach(async (wallet) => {
            const [coinTicker, address] = wallet.split('://')
            if (coinTicker && address) {
              await dispatch('addCurrencyToContact', {
                contactId: data.id,
                coinTicker,
                address
              })
            }
          })
        })
      } catch (err) {
        console.error({ err })
      }
    },
    async exportContacts({ state, rootState }, callback) {
      try {
        let contacts = [...state.list]
        if (!contacts.length) throw new Error('No existing contacts to export.')
        contacts = contacts.map((contact) => {
          const entry = { ...contact }
          delete entry.id

          // transform wallets object to CSV string
          let wallets = ''
          for (const coinTicker in entry.wallets) {
            entry.wallets[coinTicker].forEach((w) => {
              wallets = wallets + `${w.coinTicker}://${w.address},`
            })
          }
          entry.wallets = wallets.slice(0, -1) // remove last comma from string

          return entry
        })
        const headers = [
          'type',
          'firstname',
          'lastname',
          'company',
          'email',
          'domain',
          'exchangeName',
          'referralCode',
          'walletName',
          'notes',
          'wallets'
        ]
        const user = rootState.accounts.active
        const username = user.firstname + user.lastname
        const filename = `${username}.addressBook.${moment().format(
          'YYYYMMDD.HHmm'
        )}`
        await helpers.exportToCSV(contacts, headers, filename, callback)
      } catch (err) {
        console.error({ err })
      }
    },
    async loadContacts({ rootState, commit }) {
      const userId = rootState.accounts.active.id
      const loadedContacts = await contactService.getContacts(userId)
      const promises = loadedContacts.map(async (contact) => {
        commit('addContact', contact)
        return contactService.getContactCurrency(contact.id)
      })
      Promise.all(promises).then((contactWalletsResponse) => {
        contactWalletsResponse.forEach((wallets) => {
          wallets.forEach((w) => commit('setWalletToContact', w))
        })
      })
    }
  },
  getters: {
    getContactById: (state) => (id) => {
      return state.list.find((contact) => contact.id === id)
    },
    contactWalletCount: (state) => (id) => {
      const contact = state.list.find((c) => c.id === id)
      let count = 0
      Object.keys(contact.wallets).forEach((ticker) => {
        const numWallets = contact.wallets[ticker].length
        count += parseInt(numWallets)
      })
      return count
    }
  }
}

async function doesContactCurrencyExist(currency, contactId) {
  const { coinTicker, address } = currency
  // Check if each wallet exists for contact, add if does not
  const contactCurrency = await contactService.getContactCurrency(contactId)
  const exists = new Set(
    contactCurrency.map((w) => `${w.coinTicker}://${w.address}`)
  )
  return exists.has(`${coinTicker}://${address}`)
}
