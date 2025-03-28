import { app, Menu } from 'electron'
const isMac = process.platform === 'darwin'
const isDevelopment = import.meta.env.DEV

const template = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ role: 'quit' }]
        }
      ]
    : []),
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      ...(isDevelopment
        ? [
            { role: 'toggleDevTools' },
            { role: 'forceReload' },
            { type: 'separator' }
          ]
        : []),
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [])
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Keyboard Shortcuts',
        click: (menuItem, window) => {
          window.webContents.send('keyboard-shortcuts-modal-open')
        }
      },
      {
        label: 'About',
        click: (menuItem, window) => {
          window.webContents.send('about-modal-open')
        }
      },
      {
        label: 'Restore Backup',
        click: (menuItem, window) => {
          window.webContents.send('init-restore-backup')
        }
      }
    ]
  }
]

function setAppMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export default setAppMenu
