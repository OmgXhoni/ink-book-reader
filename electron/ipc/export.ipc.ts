import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export function registerExportIpc(): void {
  ipcMain.handle('export:save-image', async (_event, dataUrl: string, defaultName: string) => {
    const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg'
    const result = await dialog.showSaveDialog({
      title: 'Save Quote Image',
      defaultPath: `${defaultName}.${ext}`,
      filters: [
        { name: 'Images', extensions: ['png', 'jpg'] },
      ],
    })

    if (result.canceled || !result.filePath) return null

    // Strip data URL prefix
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(result.filePath, buffer)

    return result.filePath
  })
}
