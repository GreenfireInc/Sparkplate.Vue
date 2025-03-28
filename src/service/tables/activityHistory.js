import { DATA_TYPE } from 'jsstore'

export default {
  name: 'activities',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    activityCategory: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    date: {
      dataType: DATA_TYPE.DateTime,
      notNull: true
    },
    userId: {
      dataType: DATA_TYPE.Number,
      notNull: true
    }
  }
}
