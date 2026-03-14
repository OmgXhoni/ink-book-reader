import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { store } from '../services/store'
import { extractMetadata } from '../services/metadataExtractor'
import type { Book, BookFormat } from '../../src/types/book'

function detectFormat(filePath: string): BookFormat {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.epub': return 'epub'
    case '.pdf': return 'pdf'
    case '.txt': return 'txt'
    case '.html':
    case '.htm': return 'html'
    default: return 'txt'
  }
}

export function registerLibraryIpc(): void {
  ipcMain.handle('library:open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Add Books',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Books', extensions: ['epub', 'pdf', 'txt', 'html', 'htm'] },
        { name: 'EPUB', extensions: ['epub'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Text', extensions: ['txt', 'html', 'htm'] },
      ],
    })
    return result.filePaths
  })

  ipcMain.handle('library:add-book', async (_event, filePath: string) => {
    const books = store.get('library') as Book[]
    const existing = books.find(b => b.filePath === filePath)
    if (existing) return existing

    const format = detectFormat(filePath)
    const metadata = await extractMetadata(filePath, format)
    const id = crypto.randomUUID()

    const book: Book = {
      id,
      filePath,
      format,
      metadata,
      dateAdded: new Date().toISOString(),
      lastOpened: undefined,
    }

    store.set('library', [...books, book])
    return book
  })

  ipcMain.handle('library:get-all', () => {
    return store.get('library') as Book[]
  })

  ipcMain.handle('library:delete', (_event, bookId: string) => {
    const books = store.get('library') as Book[]
    const filtered = books.filter(b => b.id !== bookId)
    store.set('library', filtered)

    // Clean up progress and bookmarks
    const progress = store.get('progress') as Record<string, unknown>
    delete progress[bookId]
    store.set('progress', progress)

    const bookmarks = store.get('bookmarks') as Record<string, unknown>
    delete bookmarks[bookId]
    store.set('bookmarks', bookmarks)

    return true
  })

  ipcMain.handle('library:get-file-buffer', (_event, bookId: string) => {
    const books = store.get('library') as Book[]
    const book = books.find(b => b.id === bookId)
    if (!book) throw new Error('Book not found')
    if (!fs.existsSync(book.filePath)) throw new Error('File not found: ' + book.filePath)
    return fs.readFileSync(book.filePath)
  })

  ipcMain.handle('library:update-last-opened', (_event, bookId: string) => {
    const books = store.get('library') as Book[]
    const idx = books.findIndex(b => b.id === bookId)
    if (idx !== -1) {
      books[idx].lastOpened = new Date().toISOString()
      store.set('library', books)
    }
  })
}
