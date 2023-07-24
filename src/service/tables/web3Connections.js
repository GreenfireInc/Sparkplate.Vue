import { DATA_TYPE } from 'jsstore'

export default {
  name: 'web3Connections',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      dataType: DATA_TYPE.Number,
      notNull: true
    },
    date: {
      dataType: DATA_TYPE.DateTime,
      notNull: true
    },
    method: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    params: {
      dataType: DATA_TYPE.String,
      notNull: true
    }
  }
}
