/*
 * Contributors: Aciel Ochoa
 *
 * Description: This file handles all actions on the electron process.
 *   By using ipcMain we can listen for calls made from the render process.
 *   View documentation for [ipcMain/ipcRenderer](https://www.electronjs.org/docs/api/ipc-main)
 */

'use strict'
import { app, protocol, BrowserWindow, ipcMain, dialog, shell } from 'electron'
// import bugReporter from './logging/BugReporter'
// import bugTracking from './electron/bugTracking'
import path from 'path'

import EmailService from './utils/emailService'
import setAppMenu from './utils/appMenu'
import appTray from './utils/closeToAppTray.js'
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray = null
const isDevelopment = import.meta.env.MODE !== 'production'

process.env.DIST = path.join(__dirname, '..')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST, '..', 'public')
  : process.env.DIST

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      corsEnabled: true
    }
  }
])

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const preload = path.join(process.env.DIST, 'preload', 'preload.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = path.join(process.env.DIST, 'index.html')

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1000,
    height: 720,
    useContentSize: true,
    minWidth: 1000,
    minHeight: 740,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload
    },
    icon: path.join(process.env.PUBLIC, 'icon.png')
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(url)
  } else {
    win.loadFile(indexHtml)
  }

  // Open all anchor tags with target="_blank" in external browser
  const fileProtocol = url || 'app://'

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(fileProtocol)) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Set win to null after the instance has been closed
  win.on('closed', () => {
    win = null
  })

  win.on('close', function (event) {
    appTray.handleCloseEvent(win, event)
  })
}

// fix cors issue
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // cmd+\ to open up keyboard shortcut dialog

  // Add ipcMain handlers
  import('./ipcMain')
    .then(() => {
      createWindow()
      setAppMenu()
    })
    .catch((err) => {
      console.error(err)
      dialog.showErrorBox('Error on startup', err.message)
    })
})

if (isDevelopment) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension, VUEJS_DEVTOOLS }) => {
      installExtension.default(VUEJS_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true
        }
      })
    })
    .catch((e) => {
      console.error('Failed install extension:', e)
      dialog.showErrorBox('Failed installing dev tools', e.message)
    })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('setAppCloseToTray', (event, status) => {
  tray = appTray.setAppTray({ status, tray, createWindow, win })
})

// EMAIL SERVICE LISTENERS
let $mailer
ipcMain.on('emailConfig', (event, { user, config }) => {
  try {
    $mailer = new EmailService(user, config)
    event.returnValue = true
  } catch (err) {
    dialog.showErrorBox('Error', err.message)
    event.returnValue = false
    console.log(err)
  }
})

ipcMain.handle('sendEmail', async (_, payload) => {
  if (!$mailer) return new Error('Mailer not configured')
  try {
    $mailer.sendMail(payload, (info, err) => {
      if (err) {
        dialog.showErrorBox('Error', err.message)
      } else return info
    })
  } catch (err) {
    dialog.showErrorBox('Error', err.message)
    console.log(err)
  }
})
