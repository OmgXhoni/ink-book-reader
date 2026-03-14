import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { store } from '../services/store'
import { getCoversDir } from '../utils/paths'
import type { Book, BookMetadata } from '../../src/types/book'

export function registerMetadataIpc(): void {
  ipcMain.handle('metadata:update', (_event, bookId: string, metadata: Partial<BookMetadata>) => {
    const books = store.get('library') as Book[]
    const idx = books.findIndex(b => b.id === bookId)
    if (idx === -1) throw new Error('Book not found')

    books[idx].metadata = { ...books[idx].metadata, ...metadata }
    store.set('library', books)
    return books[idx]
  })

  ipcMain.handle('metadata:upload-cover', async (_event, bookId: string) => {
    const result = await dialog.showOpenDialog({
      title: 'Select Cover Image',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
      ],
    })

    if (result.canceled || !result.filePaths[0]) return null

    const sourcePath = result.filePaths[0]
    const coversDir = getCoversDir()
    const ext = path.extname(sourcePath)
    const destPath = path.join(coversDir, `${bookId}${ext}`)

    fs.copyFileSync(sourcePath, destPath)

    // Update book metadata
    const books = store.get('library') as Book[]
    const idx = books.findIndex(b => b.id === bookId)
    if (idx !== -1) {
      books[idx].metadata.coverUrl = `file://${destPath}`
      store.set('library', books)
    }

    return `file://${destPath}`
  })

  ipcMain.handle('metadata:get-cover-data', (_event, bookId: string) => {
    const books = store.get('library') as Book[]
    const book = books.find(b => b.id === bookId)
    if (!book?.metadata.coverUrl) return null

    const coverPath = book.metadata.coverUrl.replace('file://', '')
    if (!fs.existsSync(coverPath)) return null

    const data = fs.readFileSync(coverPath)
    const ext = path.extname(coverPath).slice(1)
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${data.toString('base64')}`
  })
}
