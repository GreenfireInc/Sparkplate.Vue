import { Connection } from 'jsstore'
import JsStoreWorker from 'jsstore/dist/jsstore.worker.min.js?worker'

// Import all database table schemas
import tables from './tables/index'

// middlewares
import { cypherMiddleware } from '@/service/middleware/cypherMiddleware'

export const idbCon = new Connection(new JsStoreWorker())
export const dbName = 'sparkplateDb'
export const initJsStore = async () => {
  try {
    const isDbCreated = await idbCon.initDb(getDatabase())
    idbCon.addMiddleware(cypherMiddleware)

    if (isDbCreated) {
      console.log('Database created. Version: ', getDatabase().version)
      // Perform database alters on version change here.
    } else {
      console.log('IdbService.js: db opened')
    }
  } catch (ex) {
    console.log(ex)
  }
}

const getDatabase = () => {
  const dataBase = {
    name: 'Sparkplate',
    version: 1,
    tables: [
      tables.tblUsers,
      tables.tblContacts,
      tables.tblContactAddresses,
      tables.tblActivityHistory,
      tables.tblWallets,
      tables.tblHistory,
      tables.tblUserSettings,
      tables.tblErrors,
      tables.tblWeb3Connections
    ]
  }
  return dataBase
}
