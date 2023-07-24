import { ipcMain } from 'electron'
import geoip from 'geoip-lite'

ipcMain.handle('geoipLookup', (event, ip) => {
  return geoip.lookup(ip)
})
