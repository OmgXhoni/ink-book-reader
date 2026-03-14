import { ipcMain } from 'electron'
import { store } from '../services/store'
import type { Bookmark } from '../../src/types/progress'

export function registerBookmarksIpc(): void {
  ipcMain.handle('bookmarks:get', (_event, bookId: string) => {
    const bookmarks = store.get('bookmarks') as Record<string, Bookmark[]>
    return bookmarks[bookId] || []
  })

  ipcMain.handle('bookmarks:add', (_event, bookId: string, bookmark: Bookmark) => {
    const bookmarks = store.get('bookmarks') as Record<string, Bookmark[]>
    const list = bookmarks[bookId] || []
    list.push(bookmark)
    bookmarks[bookId] = list
    store.set('bookmarks', bookmarks)
    return bookmark
  })

  ipcMain.handle('bookmarks:remove', (_event, bookId: string, bookmarkId: string) => {
    const bookmarks = store.get('bookmarks') as Record<string, Bookmark[]>
    const list = bookmarks[bookId] || []
    bookmarks[bookId] = list.filter(b => b.id !== bookmarkId)
    store.set('bookmarks', bookmarks)
    return true
  })
}
