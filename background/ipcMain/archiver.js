import { ipcMain } from 'electron'
import archiver from '../utils/archiverHelper'

ipcMain.handle('createArchive', async (event, format, options) => {
  const archive = await archiver.create(format, options)
  return archive
})
