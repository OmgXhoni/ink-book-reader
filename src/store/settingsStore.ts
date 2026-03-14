import { create } from 'zustand'
import type { AppSettings } from '@/types/settings'

const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 18,
  fontFamily: 'Georgia',
  lineHeight: 1.6,
  readerFlow: 'paginated',
  marginSize: 'medium',
  colorScheme: 'default',
}

interface SettingsState {
  settings: AppSettings
  isDark: boolean

  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
}

function computeIsDark(settings: AppSettings): boolean {
  if (settings.theme === 'dark') return true
  if (settings.theme === 'light' || settings.theme === 'sepia') return false
  // system
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isDark: false,

  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.getSettings() as AppSettings
      set({ settings, isDark: computeIsDark(settings) })
    } catch {
      set({ settings: defaultSettings, isDark: false })
    }
  },

  updateSettings: async (partial) => {
    try {
      const updated = await window.electronAPI.updateSettings(partial as Record<string, unknown>) as AppSettings
      set({ settings: updated, isDark: computeIsDark(updated) })
    } catch (err) {
      console.error('Failed to update settings:', err)
    }
  },
}))
