/*
 * Contributors: Aciel Ochoa
 *
 * Description: This file contains CRUD methods for the userSettings database table
 *
 */

import { idbCon } from './IdbService'

export default class SettingsService {
  constructor() {
    this.tableName = 'userSettings'
  }

  async getUserSettings(userId) {
    try {
      const [settings] = await idbCon.select({
        from: this.tableName,
        where: {
          userId
        }
      })
      return settings
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async addUserSettings(userId, config) {
    try {
      const added = await idbCon.insert({
        into: this.tableName,
        values: [
          {
            userId,
            ...config
          }
        ]
      })
      return added
    } catch (error) {
      console.error(error)
      return null
    }
  }

  updateUserSettings(userId, settings) {
    return idbCon.update({
      in: this.tableName,
      set: {
        ...settings
      },
      where: {
        userId
      }
    })
  }
}
