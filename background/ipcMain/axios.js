// look into coinmarket cap api call
// will need to incorporate all Axios call across the app here for now
// needs to be async call
// use preload.js to invoke
// keep in mind arguments being passed in
// NOTE: change to window.axios in main.js with tie to Vue.protype.$axios
// passing data through IPC : https://www.electronjs.org/docs/latest/tutorial/ipc#object-serialization
// see also https://www.electronjs.org/docs/latest/tutorial/message-ports
import axios from 'axios'
import { ipcMain } from 'electron'

ipcMain.handle('axiosGet', async (event, url, options) => {
  try {
    const res = await axios.get(url, options)
    // The coinbasepro balance could be returning the accountId that is needed for History calls to coinbase
    // Dump is too large and gets cutoff in terminal (only place it can be viewed)
    // We need a way to access the full response for api calls returned here
    // leaving a basic example for trapping on coinbase balance url, maybe we can write to a log file
    // if (url === 'https://api.pro.coinbase.com/accounts') {
    //   console.log('** axios.js full res >>')
    //   console.log(res)
    // }
    // having issues with Tezos Tzstats, can not clone object error, do further testing
    // could be related to returning res.data instead of full reponse?
    // console.log('** axios.js axiosGet >', res.data)
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
