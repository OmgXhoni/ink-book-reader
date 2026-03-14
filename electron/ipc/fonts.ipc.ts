import { ipcMain, dialog } from 'electron'
import { store } from '../services/store'
import { importFont, deleteFont, getFontDataUrl } from '../services/fontManager'
import type { CustomFont } from '../../src/types/font'

export function registerFontsIpc(): void {
  ipcMain.handle('fonts:get-all', () => {
    return store.get('fonts') as CustomFont[]
  })

  ipcMain.handle('fonts:import', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Fonts',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Fonts', extensions: ['ttf', 'otf'] },
      ],
    })

    if (result.canceled || !result.filePaths.length) return []

    const fonts = store.get('fonts') as CustomFont[]
    const newFonts: CustomFont[] = []

    for (const filePath of result.filePaths) {
      const font = importFont(filePath)
      newFonts.push(font)
    }

    store.set('fonts', [...fonts, ...newFonts])
    return newFonts
  })

  ipcMain.handle('fonts:delete', (_event, fontId: string) => {
    const deleted = deleteFont(fontId)
    if (deleted) {
      const fonts = store.get('fonts') as CustomFont[]
      store.set('fonts', fonts.filter(f => f.id !== fontId))
    }
    return deleted
  })

  ipcMain.handle('fonts:get-data-url', (_event, fontId: string) => {
    return getFontDataUrl(fontId)
  })
}
