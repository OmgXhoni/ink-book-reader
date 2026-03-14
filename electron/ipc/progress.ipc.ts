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
}
