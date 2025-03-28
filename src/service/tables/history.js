import { DATA_TYPE } from 'jsstore'

export default {
  name: 'history',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      dataType: DATA_TYPE.Number,
      notNull: true
    },
    type: {
      notNull: true,
      dataType: DATA_TYPE.String
    },
    action: {
      notNull: true,
      dataType: DATA_TYPE.String
    }
  }
}
