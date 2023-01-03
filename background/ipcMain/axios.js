// look into coinmarket cap api call
// will need to incorporate all Axios call across the app here for now
// needs to be async call
// use preload.js to invoke
// keep in mind arguments being passed in
// NOTE: change to window.axios in main.js with tie to Vue.protype.$axios
// passing data through IPC : https://www.electronjs.org/docs/latest/tutorial/ipc#object-serialization
// see also https://www.electronjs.org/docs/latest/tutorial/message-ports
const { default: axios } = require('axios')
const { ipcMain } = require('electron')

ipcMain.handle('axiosGet', async (event, url, options) => {
  try {
    const res = await axios.get(url, options)
    return res.data
  } catch (err) {
    return err
  }
})
ipcMain.handle('axiosPost', async (event, url, data, options) => {
  try {
    const res = await axios.post(url, data, options)
    return res.data
  } catch (err) {
    return err
  }
})
