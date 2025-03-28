import { idbCon } from './IdbService'

export async function exportToJson() {
  const tableNames = getTableNames()
  const exportObject = {}

  if (tableNames.length === 0) {
    return JSON.stringify(exportObject)
  } else {
    const promises = []
    for (const tableName of tableNames) {
      const promise = idbCon
        .select({ from: tableName, bypassCypherMiddleware: true })
        .then((results) => ({ tableName, values: results }))
      promises.push(promise)
    }

    try {
      const results = await Promise.allSettled(promises)
      for (const result of results) {
        exportObject[result.value.tableName] = result.value.values
      }
    } catch (err) {
      console.error(err)
    }

    return JSON.stringify(exportObject)
  }
}

export async function importFromJson(json) {
  const importObject = JSON.parse(json)
  const tableNames = getTableNames()

  const promises = []
  for (const tableName of tableNames) {
    if (!importObject[tableName]) continue

    const toAdd = importObject[tableName].map((obj) => {
      if (obj.date) obj.date = new Date(obj.date)
      return obj
    })
    const promise = idbCon.insert({
      into: tableName,
      values: toAdd,
      bypassCypherMiddleware: true
    })
    promises.push(promise)
  }

  const results = await Promise.allSettled(promises)
  for (const result of results) {
    if (result.status !== 'fulfilled') throw new Error(result)
  }
}

export async function clearDatabase() {
  const tableNames = getTableNames()

  const promises = []
  for (const tableName of tableNames) {
    const promise = idbCon.remove({ from: tableName })
    promises.push(promise)
  }

  const results = await Promise.allSettled(promises)
  for (const result of results) {
    if (result.status !== 'fulfilled') throw new Error(result)
  }
}

function getTableNames() {
  const tables = idbCon.database.tables
  const tableNames = tables
    .map((table) => table.name)
    .filter((name) => name !== 'JsStore_Meta')
  return tableNames
}
