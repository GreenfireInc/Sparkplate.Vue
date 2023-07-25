import { DATA_TYPE } from 'jsstore'

export default {
  name: 'contacts',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    email: {
      dataType: DATA_TYPE.String,
      notNull: false
    },
    firstname: {
      dataType: DATA_TYPE.String,
      notNull: false
    },
    lastname: {
      dataType: DATA_TYPE.String
    },
    company: {
      dataType: DATA_TYPE.String
    },
    domain: {
      dataType: DATA_TYPE.String
    },
    exchangeName: {
      dataType: DATA_TYPE.String
    },
    referralCode: {
      dataType: DATA_TYPE.String
    },
    walletName: {
      dataType: DATA_TYPE.String
    },
    notes: {
      dataType: DATA_TYPE.String
    },
    userId: {
      dataType: DATA_TYPE.Number
    }
  },
  alter: {
    2: {
      modify: {
        firstname: {
          notNull: true
        }
      },
      add: {
        domain: {
          dataType: DATA_TYPE.String
        },
        notes: {
          dataType: DATA_TYPE.String
        }
      }
    },
    6: {
      modify: {
        email: {
          notNull: false
        },
        firstname: {
          notNull: false
        }
      },
      add: {
        type: {
          dataType: DATA_TYPE.String,
          notNull: true
        },
        exchangeName: {
          dataType: DATA_TYPE.String
        },
        referralCode: {
          dataType: DATA_TYPE.String
        },
        walletName: {
          dataType: DATA_TYPE.String
        }
      }
    }
  }
}
