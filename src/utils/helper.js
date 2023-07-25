/*
 * Contributors: Aciel Ochoa
 *
 * Description: This file contains various helper functions for use
 *  throughout the application
 */

import csv from 'csvtojson'

function handleError(err) {
  console.error({ err })
  window.dialog.showErrorBox('Error!', `${err}`)
}

export async function fetchJSONfile() {
  try {
    const { filePaths, canceled } = await window.dialog.showOpenDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePaths) {
      return
    }
    const data = await window.fs.readFileSync(filePaths[0], 'utf-8')
    const fileContent = JSON.parse(data)

    return fileContent
  } catch (err) {
    console.log({ err })
    window.dialog.showErrorBox('Error!', `${err}`)
  }
}
export async function createJSONfile(exportWalletObj, filename) {
  const { filePath, canceled } = await window.dialog.showSaveDialog({
    defaultPath: `*/${filename}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (canceled || filePath === undefined) {
    return false
  }

  return new Promise((resolve, reject) => {
    window.fs.writeFile(
      filePath,
      JSON.stringify(exportWalletObj),
      'utf8',
      (err) => {
        if (err) {
          window.dialog.showErrorBox('Error!', `${err.message}`)
          reject(err)
        } else resolve(filePath)
      }
    )
  })
}

export async function importFromCSV() {
  console.log('import helper called')
  try {
    const { filePaths, canceled } = await window.dialog.showOpenDialog({
      title: 'Import contacts from CSV file',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['openFile']
    })
    console.log({ filePaths, canceled })
    if (canceled || !filePaths) {
      return
    }
    const data = await window.fs.readFileSync(filePaths[0], 'utf-8')
    const fileContent = await csv().fromString(data.toString())

    return fileContent
  } catch (err) {
    handleError(err)
  }
}
export async function exportToCSV(content, headers, filename, callback) {
  if (!headers || !Array.isArray(headers)) return
  content = content.map((tx) => {
    const obj = {}
    headers.forEach((header) => {
      obj[header] = tx[header]
    })
    return obj
  })

  // specify how you want to handle null values here
  const replacer = (key, value) => (value === null ? '' : value)
  let csv = content.map((row) =>
    headers
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(',')
  )
  csv.unshift(headers.join(','))
  csv = csv.join('\r\n')
  console.log({ csv })

  const { filePath, canceled } = await window.dialog.showSaveDialog({
    defaultPath: `*/${filename}.csv`,
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  })
  if (canceled || filePath === undefined) {
    return
  }
  window.fs.writeFile(filePath, csv, 'utf8', (err) => {
    if (err) {
      console.log({ err })
      window.dialog.showErrorBox('Error!', `${err}`)
    } else {
      if (callback) callback(filePath)
    }
  })
}
export async function exportToPNG(img, _fileName, callback = null) {
  // Optional callback parameter to be called on success file save
  const { filePath: fileName, canceled } = await window.dialog.showSaveDialog({
    defaultPath: `*/${_fileName}`,
    filters: [{ name: 'PNG', extensions: ['png'] }]
  })
  if (canceled || fileName === undefined) {
    return
  }

  const data = img.replace(/^data:image\/\w+;base64,/, '')
  const buf = Buffer.from(data, 'base64')

  window.fs.writeFile(fileName, buf, (err) => {
    if (err) {
      console.log({ err })
      window.dialog.showErrorBox('Error!', `${err}`)
    } else {
      if (callback) callback(fileName)
    }
  })
}

export default {
  fetchJSONfile,
  createJSONfile,
  importFromCSV,
  exportToCSV,
  exportToPNG
}
