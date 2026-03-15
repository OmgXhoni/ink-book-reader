import { ipcMain } from 'electron'
import { store } from '../services/store'
import type { ReadingProgress } from '../../src/types/progress'

export function registerProgressIpc(): void {
  ipcMain.handle('progress:get', (_event, bookId: string) => {
    const progress = store.get('progress') as Record<string, ReadingProgress>
    return progress[bookId] || null
  })

  ipcMain.handle('progress:save', (_event, bookId: string, progress: ReadingProgress) => {
    const allProgress = store.get('progress') as Record<string, ReadingProgress>
    allProgress[bookId] = progress
    store.set('progress', allProgress)
    return true
  })

  ipcMain.handle('progress:reset', (_event, bookId: string) => {
    // Delete progress
    const allProgress = store.get('progress') as Record<string, ReadingProgress>
    delete allProgress[bookId]
    store.set('progress', allProgress)

    // Delete bookmarks
    const allBookmarks = store.get('bookmarks') as Record<string, unknown[]>
    delete allBookmarks[bookId]
    store.set('bookmarks', allBookmarks)

    // Delete highlights
    const allHighlights = store.get('highlights') as Record<string, unknown[]>
    delete allHighlights[bookId]
    store.set('highlights', allHighlights)

    // Clear lastOpened on the book
    const books = store.get('library') as Array<{ id: string; lastOpened?: string }>
    const idx = books.findIndex(b => b.id === bookId)
    if (idx !== -1) {
      delete books[idx].lastOpened
      store.set('library', books)
    }

    return true
  })
}
