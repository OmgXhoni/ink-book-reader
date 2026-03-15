import { ipcMain, dialog, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { store } from '../services/store'
import { importFont, deleteFont, getFontDataUrl } from '../services/fontManager'
import type { CustomFont } from '../../src/types/font'

function getBundledFontsDir(): string {
  return path.join(app.getAppPath(), 'assets', 'fonts')
}

export function registerFontsIpc(): void {
  ipcMain.handle('fonts:get-all', () => {
    return store.get('fonts') as CustomFont[]
  })

  ipcMain.handle('fonts:get-bundled-data-url', (_event, familyId: string, fileName: string) => {
    try {
      const filePath = path.join(getBundledFontsDir(), familyId, fileName)
      if (!fs.existsSync(filePath)) return null
      const data = fs.readFileSync(filePath)
      const base64 = data.toString('base64')
      const ext = path.extname(fileName).toLowerCase()
      const mimeType = ext === '.otf' ? 'font/otf' : 'font/ttf'
      return `data:${mimeType};base64,${base64}`
    } catch {
      return null
    }
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
