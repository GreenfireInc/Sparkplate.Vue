const { ipcMain } = require('electron')
const archiver = require('archiver')
const archiverZipEncryptable = require('archiver-zip-encryptable')

ipcMain.handle('createArchive', async (event, format, options) => {
  if (options.password && !archiver.isRegisteredFormat('zip-encryptable')) {
    await registerZipEncryptableFormat()
  }
  return archiver.create(format, options)
})

async function registerZipEncryptableFormat () {
  await archiver.registerFormat('zip-encryptable', archiverZipEncryptable)
}
