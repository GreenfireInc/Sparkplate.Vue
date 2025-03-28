import XLSX from 'xlsx'

export const exportAsXls = (jsonData, stringOrObj, callback) => {
  const tempWorksheet = XLSX.utils.json_to_sheet(jsonData, { cellDates: true })
  const formattedJsonData = XLSX.utils.sheet_to_json(tempWorksheet, {
    defval: 'N/A'
  })
  const worksheet = XLSX.utils.json_to_sheet(formattedJsonData, {
    cellDates: true
  })
  const newWorkbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS')
  if (typeof stringOrObj === 'string') {
    XLSX.writeFile(newWorkbook, stringOrObj)
    callback()
  } else {
    const { ext } = stringOrObj
    const wopts = { bookType: ext || 'xlsx', type: 'array', cellDates: true }
    const wbout = XLSX.write(newWorkbook, wopts)
    callback(wbout)
  }
}
