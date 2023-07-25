import { DATA_TYPE } from 'jsstore'

export default {
  name: 'userSettings',
  columns: {
    id: {
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      dataType: DATA_TYPE.Number,
      notNull: true
    },
    mfaEnabled: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    mfaUseQr: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    mfaRequireOnLogin: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    mfaRequireOnDashboardSend: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    mfaRequireOnQuickExchange: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    analyticsOptIn: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    toggleTimeout: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    toggleTimeoutValue: {
      dataType: DATA_TYPE.Number,
      notNull: true
    },
    remoteSending: {
      dataType: DATA_TYPE.Boolean,
      notNull: true
    },
    notificationsEnabled: {
      dataType: DATA_TYPE.Boolean
    },
    appToTrayEnabled: {
      dataType: DATA_TYPE.Boolean
    },
    bugTrackingEnabled: {
      dataType: DATA_TYPE.Boolean
    },
    emailConfigUsername: {
      dataType: DATA_TYPE.String
    },
    emailConfigPassword: {
      dataType: DATA_TYPE.String
    },
    emailConfigHost: {
      dataType: DATA_TYPE.String
    },
    emailConfigPort: {
      dataType: DATA_TYPE.Number
    },
    emailConfigTls: {
      dataType: DATA_TYPE.Boolean
    },
    networkSelection: {
      dataType: DATA_TYPE.Object
    },
    visibilityToggles: {
      dataType: DATA_TYPE.Object
    }
  }
}
