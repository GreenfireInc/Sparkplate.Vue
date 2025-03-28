import { idbCon } from './IdbService'

export class ErrorService {
  constructor() {
    this.tableName = 'errors'
  }

  getErrors() {
    return idbCon.select({
      from: this.tableName
    })
  }

  async addError(error) {
    try {
      return await idbCon.insert({
        into: this.tableName,
        values: [error],
        return: true
      })
    } catch (err) {
      console.log(err)
    }
  }
}
