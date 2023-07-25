import CryptoJS from 'crypto-js'
import { idbCon } from './IdbService'
import { cypherParams } from './middleware/cypherMiddleware'

class Cypher {
  constructor() {
    this.key = ''
  }

  setEncryptionKey(key) {
    this.key = key
  }

  encrypt(data) {
    const encrypted = CryptoJS.AES.encrypt(data, this.key).toString()
    return encrypted
  }

  decrypt(data) {
    const decrypted = CryptoJS.AES.decrypt(data, this.key).toString(
      CryptoJS.enc.Utf8
    )
    return decrypted
  }

  async updateEncryptionKey({ key, userId }) {
    // retrieve all encrypted data from database
    console.log('** updateEncryptionKey top hit ************')
    const tableNames = Object.keys(cypherParams)
    const dbQueryPromises = tableNames.map((tableName) => {
      const userIdColumn = tableName === 'users' ? 'id' : 'userId'
      return idbCon.select({
        from: tableName,
        where: {
          [userIdColumn]: userId
        }
      })
    })
    const results = await Promise.allSettled(dbQueryPromises)

    // Set new encryption key, and update rows from database
    this.setEncryptionKey(key)
    const dbUpdateQuery = results.map((result, i) => {
      return idbCon.insert({
        into: tableNames[i],
        values: result.value,
        upsert: true
      })
    })

    return await Promise.allSettled(dbUpdateQuery)
  }
}

const cypher = new Cypher()
export default cypher
