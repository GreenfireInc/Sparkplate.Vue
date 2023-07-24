import {
  app,
  dialog,
  BrowserWindow,
  Notification,
  shell,
  ipcMain
} from 'electron'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { markdown } from 'markdown'

// contextBridge.app API
ipcMain.handle('preloadAppData', () => {
  return {
    osVersion: os.version(),
    processor: os.cpus()[0].model,
    systemMemory: os.totalmem(),
    userDataPath: app.getPath('userData')
  }
})

ipcMain.handle('appGetFunctional', () => {
  return process.env.functional
})

ipcMain.handle('appGetPath', (event, type) => {
  return app.getPath(type)
})

ipcMain.on('appOpenExternal', (event, url) => {
  shell.openExternal(url)
})

ipcMain.handle('appGetGPUInfo', () => {
  return app.getGPUInfo('complete')
})

ipcMain.handle('appGetReleaseInfo', () => {
  const notesPath = path.join(
    process.env.PUBLIC,
    'assets',
    'releaseNotes',
    'releaseNotes.md'
  )
  const changelogPath = path.join(
    process.env.PUBLIC,
    'assets',
    'changelog',
    'changelog.md'
  )
  const notes = fs.readFileSync(notesPath, 'utf-8')
  const changelog = fs.readFileSync(changelogPath, 'utf-8')

  return {
    notesHTML: markdown.toHTML(notes),
    changelogHTML: markdown.toHTML(changelog)
  }
})

// contextBridge.dialog API
ipcMain.handle('dialogShowMessageBox', (event, options) => {
  // Destructure options to filter unwanted content
  const { message, type, buttons } = options
  return dialog.showMessageBox({ message, type, buttons })
})

ipcMain.handle('dialogShowOpenDialog', (event, options) => {
  // Destructure options to filter unwanted content
  const { title, properties, filters, showsTagField = false } = options
  return dialog.showOpenDialog({ title, properties, filters, showsTagField })
})

ipcMain.on('dialogShowErrorBox', (event, { title, message }) => {
  dialog.showErrorBox(title, message)
})

ipcMain.handle('dialogShowSaveDialog', (event, options) => {
  // Destructure options to filter unwanted content
  const { defaultPath, filters, showsTagField = false } = options
  return dialog.showSaveDialog({ defaultPath, filters, showsTagField })
})

// contextBridge.browserWindow API
const _options = {
  // default options for printing pdf
  silent: false,
  printBackground: true,
  color: false,
  margin: {
    marginType: 'printableArea'
  },
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1
}

ipcMain.handle('createWindowForPDF', (event, html, fileName, options) => {
  // setting baseURLForDataURL allows the window to load content
  // from the public/assets directory
  let baseURLForDataURL
  if (process.env.VITE_DEV_SERVER_URL) {
    baseURLForDataURL = process.env.VITE_DEV_SERVER_URL
    // Load the url of the dev server if in development mode
  } else {
    // Load the index.html when not in development
    baseURLForDataURL = 'app://./'
  }

  // create initial window and load contents
  const win = new BrowserWindow({ show: false, frame: false })
  win.loadURL(html, { baseURLForDataURL })

  // return promise to perform print/save using 'did-finish-load' event
  return new Promise((resolve, reject) => {
    win.webContents.on('did-finish-load', () => {
      // Printing mode
      if (options.type === 'print') {
        win.webContents.print(
          options.settings || _options,
          (success, failureReason) => {
            if (!success) reject(failureReason)
            resolve(success)
            win.destroy()
          }
        )
      } else {
        // Saving mode
        win.webContents
          .printToPDF({ ...options.settings })
          .then(async (data) => {
            if (options.type === 'skip-print') {
              resolve(data)
              win.destroy()
            } else {
              const { filePath, canceled } = await dialog.showSaveDialog({
                defaultPath: `*/${fileName}`,
                filters: [{ name: 'PDF', extensions: ['pdf'] }]
              })
              if (canceled || fileName === undefined) {
                reject(new Error('Action canceled.'))
              }
              fs.writeFile(filePath, data, (err) => {
                if (err) {
                  dialog.showErrorBox('Error!', `${err}`)
                  reject(err)
                } else {
                  resolve()
                }
                win.destroy()
              })
            }
          })
          .catch((err) => {
            reject(new Error('Failed to save as PDF') || err)
            win.destroy()
          })
      }
    })
    win.webContents.on('did-fail-load', ({ errorDescription }) => {
      reject(errorDescription)
      win.destroy()
    })
  })
})

// contextBridge.notification API
ipcMain.on('createNotification', (event, options) => {
  const customNotification = new Notification(options)
  customNotification.show()
})
