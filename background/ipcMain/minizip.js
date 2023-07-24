import { ipcMain } from 'electron'
import Minizip from 'minizip-asm.js'
import { Blob } from 'buffer'
ipcMain.handle('minizipCreate', async (event, contents, password) => {
  const file = new Blob([contents], { type: 'application/pdf' })
  const mz = new Minizip()
  const arrayBuffer = await file.arrayBuffer()
  mz.append('w9.pdf', arrayBuffer, { password })
  return mz.zip()
})
