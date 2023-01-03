const { ipcMain } = require('electron')
const cryptos = require('../utils/cryptos')

ipcMain.handle('cryptosGenerateWallet', async (event, params) => {
  const { coinTicker } = params
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.generateWallet(params)
  return wallet
})

ipcMain.handle('cryptosGenerateBasicWallet', async (event, params) => {
  const { coinTicker } = params
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.generateBasicWallet(params)
  return wallet
})

ipcMain.handle('cryptosImportWallet', async (event, params) => {
  const { coinTicker } = params
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.importWallet(params)
  return wallet
})

ipcMain.handle('cryptosGetBalance', async (event, params) => {
  const { coinTicker } = params.wallet
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.getBalance(params)
  return wallet
})

ipcMain.handle('cryptosSendToAddress', async (event, params) => {
  const { coinTicker } = params.wallet
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.sendToAddress(params)
  return wallet
})
