import { ipcMain } from 'electron'
import fs from 'fs'

ipcMain.handle('fsReadFile', (event, path) => {
  return new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      resolve({ err, data })
    })
  })
})

ipcMain.handle('fsReadFileSync', (event, path, encoding) => {
  return fs.readFileSync(path, encoding)
})

ipcMain.handle('fsWrite', (event, fd, buffer) => {
  return new Promise((resolve, reject) => {
    fs.write(fd, buffer, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
})

ipcMain.handle('fsWriteFile', (event, file, data, options) => {
  return new Promise((resolve) => {
    fs.writeFile(file, data, options, (err) => {
      resolve(err)
    })
  })
})

ipcMain.handle('fsWriteFileSync', (event, file, data, options) => {
  return fs.writeFileSync(file, data, options)
})

ipcMain.handle('fsCreateWriteStream', (event, path) => {
  return fs.createWriteStream(path)
})

ipcMain.handle('fsCheckFileExists', (event, path) => {
  let flag = true
  try {
    fs.accessSync(path, fs.constants.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
})
