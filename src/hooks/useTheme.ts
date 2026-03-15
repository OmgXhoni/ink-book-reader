import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

function resolveTheme(theme: string): string {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function useTheme() {
  const { settings, isDark } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolveTheme(settings.theme)

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        root.dataset.theme = mq.matches ? 'dark' : 'light'
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [settings.theme])

  return { isDark, theme: settings.theme }
}
