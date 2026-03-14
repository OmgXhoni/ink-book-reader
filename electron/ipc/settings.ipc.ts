import { ipcMain } from 'electron'
import { store } from '../services/store'
import type { AppSettings } from '../../src/types/settings'

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', () => {
    return store.get('settings') as AppSettings
  })

  ipcMain.handle('settings:update', (_event, settings: Partial<AppSettings>) => {
    const current = store.get('settings') as AppSettings
    const updated = { ...current, ...settings }
    store.set('settings', updated)
    return updated
  })
}
