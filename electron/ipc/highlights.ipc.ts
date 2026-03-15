import { ipcMain } from 'electron'
import { store } from '../services/store'
import type { Highlight } from '../../src/types/progress'

export function registerHighlightsIpc(): void {
  ipcMain.handle('highlights:get', (_event, bookId: string) => {
    const highlights = store.get('highlights') as Record<string, Highlight[]>
    return highlights[bookId] || []
  })

  ipcMain.handle('highlights:add', (_event, bookId: string, highlight: Highlight) => {
    const highlights = store.get('highlights') as Record<string, Highlight[]>
    const list = highlights[bookId] || []
    list.push(highlight)
    highlights[bookId] = list
    store.set('highlights', highlights)
    return highlight
  })

  ipcMain.handle('highlights:remove', (_event, bookId: string, highlightId: string) => {
    const highlights = store.get('highlights') as Record<string, Highlight[]>
    const list = highlights[bookId] || []
    highlights[bookId] = list.filter(h => h.id !== highlightId)
    store.set('highlights', highlights)
    return true
  })
}
