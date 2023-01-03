const { ipcMain } = require('electron')
const geoip = require('geoip-lite')

ipcMain.handle('geoipLookup', (event, ip) => {
  return geoip.lookup(ip)
})
