import { idbCon } from './IdbService'

export default class HistoryService {
  constructor() {
    this.tableName = 'history'
  }

  async addHistory(id, history) {
    try {
      const newHistory = await idbCon.insert({
        into: this.tableName,
        values: [history],
        return: true
      })
      return newHistory
    } catch (error) {
      console.log(error)
      window.dialog.showErrorBox(
        'There was an error adding to the history',
        error.message
      )
    }
  }

  async getHistory(id) {
    return await idbCon.select({
      from: this.tableName,
      where: {
        id: id
      }
    })
  }

  async removeHistory(id) {
    return await idbCon.remove({
      from: this.tableName,
      where: {
        id: id
      }
    })
  }
}
