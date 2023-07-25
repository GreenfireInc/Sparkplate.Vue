import { ipcMain } from 'electron'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import cryptos from '../utils/cryptos'

ipcMain.handle('generateMnemonic', async (event, mnemonicPhrase = null) => {
  const phrase = mnemonicPhrase || generateMnemonic()
  const seed = await mnemonicToSeed(phrase)
  return { phrase, seed }
})

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

ipcMain.handle('cryptosGetBalances', async (event, params) => {
  const coinTicker = params.crypto.toLowerCase()
  const cryptoLib = cryptos[coinTicker]
  const response = await cryptoLib.getBalances(params)
  return response
})

ipcMain.handle('cryptosSendToAddress', async (event, params) => {
  const { coinTicker } = params.wallet
  const cryptoLib = cryptos[coinTicker.toLowerCase()]
  const wallet = await cryptoLib.sendToAddress(params)
  return wallet
})
