import { ipcMain } from 'electron'
import { authenticator } from 'otplib'

ipcMain.handle('otpCheck', (event, params) => {
  const { token, secret } = params
  return authenticator.check(token, secret)
})

ipcMain.handle('otpGenerateSecret', () => {
  return authenticator.generateSecret()
})

ipcMain.handle('otpKeyURI', (event, params) => {
  const { email, service, secret } = params
  return authenticator.keyuri(email, service, secret)
})
