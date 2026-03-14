import { contextBridge, ipcRenderer } from 'electron'

export type ElectronAPI = {
  // Library
  openBookDialog: () => Promise<string[]>
  addBook: (filePath: string) => Promise<unknown>
  getAllBooks: () => Promise<unknown[]>
  deleteBook: (bookId: string) => Promise<boolean>
  getFileBuffer: (bookId: string) => Promise<Buffer>
  updateLastOpened: (bookId: string) => Promise<void>

  // Metadata
  updateMetadata: (bookId: string, metadata: Record<string, unknown>) => Promise<unknown>
  uploadCover: (bookId: string) => Promise<string | null>
  getCoverData: (bookId: string) => Promise<string | null>

  // Progress
  getProgress: (bookId: string) => Promise<unknown>
  saveProgress: (bookId: string, progress: unknown) => Promise<boolean>

  // Bookmarks
  getBookmarks: (bookId: string) => Promise<unknown[]>
  addBookmark: (bookId: string, bookmark: unknown) => Promise<unknown>
  removeBookmark: (bookId: string, bookmarkId: string) => Promise<boolean>

  // Fonts
  getAllFonts: () => Promise<unknown[]>
  importFonts: () => Promise<unknown[]>
  deleteFont: (fontId: string) => Promise<boolean>
  getFontDataUrl: (fontId: string) => Promise<string | null>

  // Settings
  getSettings: () => Promise<unknown>
  updateSettings: (settings: Record<string, unknown>) => Promise<unknown>

  // Export
  saveImage: (dataUrl: string, defaultName: string) => Promise<string | null>

  // Events
  onFileOpened: (callback: (filePath: string) => void) => () => void
}

const api: ElectronAPI = {
  // Library
  openBookDialog: () => ipcRenderer.invoke('library:open-dialog'),
  addBook: (filePath) => ipcRenderer.invoke('library:add-book', filePath),
  getAllBooks: () => ipcRenderer.invoke('library:get-all'),
  deleteBook: (bookId) => ipcRenderer.invoke('library:delete', bookId),
  getFileBuffer: (bookId) => ipcRenderer.invoke('library:get-file-buffer', bookId),
  updateLastOpened: (bookId) => ipcRenderer.invoke('library:update-last-opened', bookId),

  // Metadata
  updateMetadata: (bookId, metadata) => ipcRenderer.invoke('metadata:update', bookId, metadata),
  uploadCover: (bookId) => ipcRenderer.invoke('metadata:upload-cover', bookId),
  getCoverData: (bookId) => ipcRenderer.invoke('metadata:get-cover-data', bookId),

  // Progress
  getProgress: (bookId) => ipcRenderer.invoke('progress:get', bookId),
  saveProgress: (bookId, progress) => ipcRenderer.invoke('progress:save', bookId, progress),

  // Bookmarks
  getBookmarks: (bookId) => ipcRenderer.invoke('bookmarks:get', bookId),
  addBookmark: (bookId, bookmark) => ipcRenderer.invoke('bookmarks:add', bookId, bookmark),
  removeBookmark: (bookId, bookmarkId) => ipcRenderer.invoke('bookmarks:remove', bookId, bookmarkId),

  // Fonts
  getAllFonts: () => ipcRenderer.invoke('fonts:get-all'),
  importFonts: () => ipcRenderer.invoke('fonts:import'),
  deleteFont: (fontId) => ipcRenderer.invoke('fonts:delete', fontId),
  getFontDataUrl: (fontId) => ipcRenderer.invoke('fonts:get-data-url', fontId),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),

  // Export
  saveImage: (dataUrl, defaultName) => ipcRenderer.invoke('export:save-image', dataUrl, defaultName),

  // Events
  onFileOpened: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, filePath: string) => callback(filePath)
    ipcRenderer.on('library:file-opened', listener)
    return () => ipcRenderer.removeListener('library:file-opened', listener)
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)
