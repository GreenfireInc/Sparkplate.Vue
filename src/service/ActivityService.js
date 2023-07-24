import { idbCon } from './IdbService'

export class ActivityService {
  constructor() {
    this.tableName = 'activities'
  }

  getActivities(id) {
    return idbCon.select({
      from: this.tableName,
      where: {
        userId: id
      }
    })
  }

  addActivity(activity) {
    return idbCon.insert({
      into: this.tableName,
      values: [activity],
      return: true
    })
  }
}
