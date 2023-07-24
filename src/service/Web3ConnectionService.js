import { idbCon } from './IdbService'

export default class Web3ConnectionService {
  constructor() {
    this.tableName = 'web3Connections'
  }

  addRequest(request, userId) {
    return idbCon.insert({
      into: this.tableName,
      values: [
        {
          ...request,
          userId
        }
      ]
    })
  }

  getUserHistory(userId) {
    return idbCon.select({
      from: this.tableName,
      where: {
        userId
      },
      order: {
        by: 'date',
        type: 'desc'
      }
    })
  }
}
