/*
 * Contributors: Aciel Ochoa
 *
 * Description: This file contains CRUD methods for the contacts table
 *  of the Sparkplate database
 */

import { idbCon } from './IdbService'
import bugReporter from '../logging/BugReporter'

export default class ContactService {
  constructor() {
    this.tableName = 'contacts'
    this.bugReporter = bugReporter
  }

  async addContact(userId, contact) {
    try {
      // For regular contact types, check if contact with email already exists for user
      if (contact.type === 'regular') {
        const [found] = await idbCon.select({
          from: this.tableName,
          where: {
            type: 'regular',
            email: contact.email,
            userId
          }
        })
        if (found)
          throw new Error(
            'A contact with that email already exists for this user.'
          )
      }
      const [newContact] = await idbCon.insert({
        into: this.tableName,
        values: [
          {
            ...contact,
            userId
          }
        ],
        return: true
      })
      return newContact
    } catch (error) {
      this.bugReporter(error)
    }
  }

  async getContacts(userId) {
    return idbCon.select({
      from: this.tableName,
      where: {
        userId
      }
    })
  }

  async getContactBy(identifier) {
    // identifier - OBJECT key value pair representing a column in contacts table
    const [contact] = await idbCon.select({
      from: this.tableName,
      where: identifier
    })
    return contact
  }

  async removeContact(id) {
    const promises = [
      idbCon.remove({
        from: this.tableName,
        where: {
          id: id
        }
      }),
      idbCon.remove({
        from: 'contactAddresses',
        where: {
          contactId: id
        }
      })
    ]

    return Promise.all(promises)
  }

  async updateContactById(contact) {
    return await idbCon.update({
      in: this.tableName,
      set: {
        ...contact
      },
      where: {
        id: contact.id
      }
    })
  }

  async addCurrencyToContact(contactId, currency) {
    return idbCon.insert({
      into: 'contactAddresses',
      values: [
        {
          contactId,
          coinTicker: currency.coinTicker,
          address: currency.address
        }
      ],
      return: true
    })
  }

  updateContactCurrency(currency) {
    return idbCon.update({
      in: 'contactAddresses',
      set: {
        coinTicker: currency.coinTicker,
        address: currency.address
      },
      where: {
        id: currency.id
      }
    })
  }

  removeCurrencyFromContact(id) {
    return idbCon.remove({
      from: 'contactAddresses',
      where: {
        id: id
      }
    })
  }

  getContactCurrency(contactId) {
    return idbCon.select({
      from: 'contactAddresses',
      where: {
        contactId
      }
    })
  }
}
