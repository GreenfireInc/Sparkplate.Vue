import { Parser } from 'json2csv'

const convertToCsv = (jsonData) => {
  const opts = { defaultValue: 'N/A' }
  const json2csvParser = new Parser(opts)
  const csv = json2csvParser.parse(jsonData)
  return csv
  // const items = jsonData
  // const replacer = (key, value) => (value === null ? '' : value) // specify how you want to handle null values here
  // const header = Object.keys(items[0])
  // const csv = items.map(row =>
  //   header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
  // )
  // csv.unshift(header.join(','))
  // return csv.join('\r\n')
}

export const generateBlob = (jsonData, callback) => {
  const data = convertToCsv(jsonData)
  const file = new Blob(['\ufeff', data], { type: 'text/csv;charset=utf-8' })
  callback(window.URL.createObjectURL(file), Buffer.from(data))
  // callback(convertToCsv(jsonData))
}

export const csvOutput = (data) => {
  return convertToCsv(data)
}
