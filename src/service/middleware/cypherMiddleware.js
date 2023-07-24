/*
 * Contributors: Aciel Ochoa
 *
 * Description: Cypher Middleware is used for identifying tables/columns
 *  to encrypt/decrypt. To add an item, simply add an array of columns to
 *  the cypherParams object.
 */

import cypher from '../Cypher'

// cypherParams defines which tables and columns will use encryption
// tableName should be listed as the key, with columns listed
// as an array of strings
export const cypherParams = {
  wallets: ['wif', 'privateKey'],
  users: ['googleAuthenticatorCode', 'mnemonic'],
  userSettings: ['emailConfigPassword']
}

function handleEncryption(request, columns) {
  const query = request.query
  const isUpdate = request.name === 'update'
  // Store original values for return onResult
  // data gets set according to boolean isUpdate
  // use stringify to make sure data does not get mutated especially with nested object values
  const originalValues = isUpdate
    ? JSON.parse(JSON.stringify(query.set))
    : query.values.map((entry) => JSON.parse(JSON.stringify(entry))) // use .map() to store a new instance of values

  // Encrypt defined columns and assign value to query.values/query.set
  for (const column of columns) {
    if (isUpdate) {
      if (query.set[column])
        query.set[column] = cypher.encrypt(query.set[column])
    } else {
      for (const entry of query.values) {
        if (entry[column]) entry[column] = cypher.encrypt(entry[column])
      }
    }
  }
  // Restore original values for returning to client
  request.onResult((results) => {
    // Results will often be a number of updated/inserted rows
    // Only modify results when Array dataset is returned
    if (Array.isArray(results)) {
      return results.map((entry, i) => {
        for (const column of columns) {
          entry[column] = originalValues[i][column]
        }
        return entry
      })
    } else {
      return results
    }
  })
}

function handleDecryption(request, columns) {
  // Decrypt data prior to returning to client
  request.onResult((results) => {
    // NOTE: UI saves the unecrypted version of this data, make sure everything stays in sync
    return results.map((entry) => {
      for (const column of columns) {
        if (entry[column]) {
          const decrypted = cypher.decrypt(entry[column])
          entry[column] = decrypted
        }
      }
      return entry
    })
  })
}

export const cypherMiddleware = function (request) {
  const query = request.query

  // Cypher Middleware can be bypassed if the request query object contains { bypassCypherMiddleware: true }
  if (query.bypassCypherMiddleware) return request

  switch (request.name) {
    case 'insert':
    case 'upsert':
      if (query.into in cypherParams) {
        handleEncryption(request, cypherParams[query.into])
      }
      break
    case 'update':
      if (query.in in cypherParams) {
        handleEncryption(request, cypherParams[query.in])
      }
      break
    case 'select':
      if (query.from in cypherParams) {
        handleDecryption(request, cypherParams[query.from])
      }
      break
    case 'count':
    case 'remove':
      return request
    default:
      console.warn(
        `Unhandled database query(${request.name}) invoked cypherMiddleware.`,
        request
      )
  }
}
