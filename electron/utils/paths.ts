import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export function getUserDataPath(...segments: string[]): string {
  return path.join(app.getPath('userData'), ...segments)
}

export function getCoversDir(): string {
  const dir = getUserDataPath('covers')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export function getFontsDir(): string {
  const dir = getUserDataPath('fonts')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export function initUserDataDirs(): void {
  getCoversDir()
  getFontsDir()
}
