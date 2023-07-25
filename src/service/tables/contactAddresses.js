import { DATA_TYPE } from 'jsstore'

export default {
  name: 'contactAddresses',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    contactId: {
      dataType: DATA_TYPE.Number,
      notNull: true
    },
    coinTicker: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    address: {
      dataType: DATA_TYPE.String,
      notNull: true
    }
  },
  alter: {
    2: {
      drop: {
        currency: {}
      },
      add: {
        coinTicker: {
          dataType: DATA_TYPE.String,
          notNull: true
        }
      }
    }
  }
}
