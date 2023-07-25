import { DATA_TYPE } from 'jsstore'

export default {
  name: 'wallets',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      dataType: DATA_TYPE.DateTime,
      notNull: true
    },
    coinTicker: {
      notNull: true,
      dataType: DATA_TYPE.String
    },
    nickname: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    isHDWallet: {
      notNull: true,
      dataType: DATA_TYPE.Boolean
    },
    derivationPath: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    publicKey: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    privateKey: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    wif: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    address: {
      notNull: false,
      dataType: DATA_TYPE.String
    },
    balance: {
      notNull: false,
      dataType: DATA_TYPE.Number
    },
    userId: {
      notNull: true,
      dataType: DATA_TYPE.Number
    },
    activityCategory: {
      dataType: DATA_TYPE.String,
      notNull: true
    }
  }
}
