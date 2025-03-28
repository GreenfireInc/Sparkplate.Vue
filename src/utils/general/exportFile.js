export const exportAsFile = async (
  fileName,
  contents,
  options,
  callback,
  password
) => {
  try {
    const zip = await window.minizip.create(contents, password)
    const blob = new Blob([zip], { type: 'octet/stream' })
    const element = document.createElement('a')
    const dataUrl = window.URL.createObjectURL(blob)
    element.href = dataUrl
    element.download = fileName
    element.click()
    callback()
  } catch (e) {
    callback(e)
  }
}
