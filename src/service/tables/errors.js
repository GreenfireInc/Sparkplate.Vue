import { DATA_TYPE } from 'jsstore'

export default {
  name: 'errors',
  columns: {
    error: {
      notNull: true,
      dataType: DATA_TYPE.String
    }
  }
}
