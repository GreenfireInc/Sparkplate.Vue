import { app, Tray, Menu, globalShortcut } from 'electron'
import path from 'node:path'

class AppTray {
  constructor() {
    this.appTrayEnabled = false
  }

  setAppTray({ status, tray, createWindow, win }) {
    this.appTrayEnabled = status

    if (this.appTrayEnabled) {
      if (tray === null) {
        const icon = getAppTrayIcon()
        tray = new Tray(icon)
        const contextMenu = Menu.buildFromTemplate([
          {
            label: 'Show App',
            click: function () {
              if (win === null) {
                createWindow()
              } else if (win.isVisible()) {
                win.focus()
              } else {
                win.show()
              }
            }
          },
          {
            label: 'Quit',
            click: function () {
              win.destroy()
              app.quit()
            }
          }
        ])
        tray.setToolTip('Sparkplate.vue')
        tray.setContextMenu(contextMenu)
      }

      // Register global shortcut to prevent app from quiting
      globalShortcut.register('CommandOrControl+Q', () => win.hide())
    } else if (tray !== null) {
      // destroy tray if it is set to reset process
      tray.destroy()
      tray = null
    }

    return tray
  }

  handleCloseEvent(win, event) {
    if (this.appTrayEnabled) {
      event.preventDefault()
      win.hide()
    }
  }
}

function getAppTrayIcon() {
  if (process.platform === 'win32') {
    // use ico
    return path.join(process.env.PUBLIC, 'assets', 'appbar', 'appbar.ico')
  } else {
    // use template image
    return path.join(
      process.env.PUBLIC,
      'assets',
      'appbar',
      'appbarTemplate.png'
    )
  }
}

export default new AppTray()
