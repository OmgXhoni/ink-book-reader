import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { initUserDataDirs } from './utils/paths'
import { registerLibraryIpc } from './ipc/library.ipc'
import { registerMetadataIpc } from './ipc/metadata.ipc'
import { registerProgressIpc } from './ipc/progress.ipc'
import { registerBookmarksIpc } from './ipc/bookmarks.ipc'
import { registerHighlightsIpc } from './ipc/highlights.ipc'
import { registerFontsIpc } from './ipc/fonts.ipc'
import { registerSettingsIpc } from './ipc/settings.ipc'
import { registerExportIpc } from './ipc/export.ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const preloadPath = path.join(__dirname, 'preload.js')

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Ink',
    icon: path.join(__dirname, '../assets/icons/icon.ico'),
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    frame: true,
    show: false,
  })

  // Load app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Handle file associations
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (mainWindow) {
    mainWindow.webContents.send('library:file-opened', filePath)
  }
})

app.on('second-instance', (_event, argv) => {
  const filePath = argv.find(arg => /\.(epub|pdf|txt|html)$/i.test(arg))
  if (filePath && mainWindow) {
    mainWindow.webContents.send('library:file-opened', filePath)
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  initUserDataDirs()

  // Register all IPC handlers
  registerLibraryIpc()
  registerMetadataIpc()
  registerProgressIpc()
  registerBookmarksIpc()
  registerHighlightsIpc()
  registerFontsIpc()
  registerSettingsIpc()
  registerExportIpc()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
