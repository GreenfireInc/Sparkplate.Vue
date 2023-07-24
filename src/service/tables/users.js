import { DATA_TYPE } from 'jsstore'

const tblUsers = {
  name: 'users',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      notNull: true,
      dataType: DATA_TYPE.String
    },
    password: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    mnemonic: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    firstname: {
      notNull: true,
      dataType: DATA_TYPE.String
    },
    lastname: {
      dataType: DATA_TYPE.String,
      notNull: true
    },
    company: {
      dataType: DATA_TYPE.String,
      notNull: false
    },
    address: {
      dataType: DATA_TYPE.String,
      notNull: false
    },
    country: {
      dataType: DATA_TYPE.String
    },
    stateProvince: {
      dataType: DATA_TYPE.String
    },
    city: {
      dataType: DATA_TYPE.String
    },
    zip: {
      dataType: DATA_TYPE.String
    },
    timezone: {
      dataType: DATA_TYPE.String
    },
    currency: {
      dataType: DATA_TYPE.String
    },
    globalCurrency: {
      dataType: DATA_TYPE.String
    },
    udomain: {
      dataType: DATA_TYPE.String
    },
    website: {
      dataType: DATA_TYPE.String
    },
    twitter: {
      dataType: DATA_TYPE.String
    },
    instagram: {
      dataType: DATA_TYPE.String
    },
    phone: {
      dataType: DATA_TYPE.String
    },
    signatureStyle: {
      dataType: DATA_TYPE.String
    },
    addressBookToggle: {
      dataType: DATA_TYPE.Boolean
    },
    annotationsToggle: {
      dataType: DATA_TYPE.Boolean
    },
    prefixedAddressesToggle: {
      dataType: DATA_TYPE.Boolean
    },
    emailAccompanyToggle: {
      dataType: DATA_TYPE.Boolean
    },
    userProfileType: {
      dataType: DATA_TYPE.String
    },
    companyTypeIndex: {
      dataType: DATA_TYPE.Number
    },
    googleAuthenticatorCode: {
      dataType: DATA_TYPE.String
    },
    binanceApiSecret: {
      dataType: DATA_TYPE.String
    },
    binanceApiKey: {
      dataType: DATA_TYPE.String
    },
    binanceActive: {
      dataType: DATA_TYPE.Boolean
    },
    cexApiSecret: {
      dataType: DATA_TYPE.String
    },
    cexApiKey: {
      dataType: DATA_TYPE.String
    },
    cexActive: {
      dataType: DATA_TYPE.Boolean
    },
    cexApiPassphrase: {
      dataType: DATA_TYPE.String
    },
    coinbaseApiSecret: {
      dataType: DATA_TYPE.String
    },
    coinbaseApiKey: {
      dataType: DATA_TYPE.String
    },
    coinbaseActive: {
      dataType: DATA_TYPE.Boolean
    },
    coinbaseApiPassphrase: {
      dataType: DATA_TYPE.String
    },
    hitbtcApiSecret: {
      dataType: DATA_TYPE.String
    },
    hitbtcApiKey: {
      dataType: DATA_TYPE.String
    },
    hitbtcActive: {
      dataType: DATA_TYPE.Boolean
    },
    kucoinApiSecret: {
      dataType: DATA_TYPE.String
    },
    kucoinApiKey: {
      dataType: DATA_TYPE.String
    },
    kucoinActive: {
      dataType: DATA_TYPE.Boolean
    },
    kucoinApiPassphrase: {
      dataType: DATA_TYPE.String
    },
    localbitcoinsApiSecret: {
      dataType: DATA_TYPE.String
    },
    localbitcoinsApiKey: {
      dataType: DATA_TYPE.String
    },
    localbitcoinsActive: {
      dataType: DATA_TYPE.Boolean
    },
    geminiApiSecret: {
      dataType: DATA_TYPE.String
    },
    geminiApiKey: {
      dataType: DATA_TYPE.String
    },
    geminiActive: {
      dataType: DATA_TYPE.Boolean
    },
    bitflyersApiSecret: {
      dataType: DATA_TYPE.String
    },
    bitflyersApiKey: {
      dataType: DATA_TYPE.String
    },
    bitflyersActive: {
      dataType: DATA_TYPE.Boolean
    },
    login_history: {
      dataType: DATA_TYPE.Array
    }
  },
  alter: {
    7: {
      add: {
        companyTypeIndex: {
          dataType: DATA_TYPE.Number
        }
      }
    }
  }
}

export default tblUsers
