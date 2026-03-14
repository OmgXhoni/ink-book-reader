import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { getFontsDir } from '../utils/paths'
import type { CustomFont } from '../../src/types/font'
import { store } from './store'

export function importFont(sourcePath: string): CustomFont {
  const fontsDir = getFontsDir()
  const ext = path.extname(sourcePath).toLowerCase()
  const id = crypto.randomUUID()
  const destFileName = `${id}${ext}`
  const destPath = path.join(fontsDir, destFileName)

  fs.copyFileSync(sourcePath, destPath)

  const fontName = path.basename(sourcePath, ext)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const font: CustomFont = {
    id,
    name: fontName,
    filePath: destPath,
    format: ext.slice(1) as 'ttf' | 'otf',
    dateAdded: new Date().toISOString(),
  }

  return font
}

export function deleteFont(fontId: string): boolean {
  const fonts = store.get('fonts') as CustomFont[]
  const font = fonts.find(f => f.id === fontId)
  if (!font) return false

  try {
    if (fs.existsSync(font.filePath)) {
      fs.unlinkSync(font.filePath)
    }
    return true
  } catch {
    return false
  }
}

export function getFontDataUrl(fontId: string): string | null {
  const fonts = store.get('fonts') as CustomFont[]
  const font = fonts.find(f => f.id === fontId)
  if (!font || !fs.existsSync(font.filePath)) return null

  const data = fs.readFileSync(font.filePath)
  const base64 = data.toString('base64')
  const mimeType = font.format === 'otf' ? 'font/otf' : 'font/ttf'
  return `data:${mimeType};base64,${base64}`
}
