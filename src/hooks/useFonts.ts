import { useEffect } from 'react'
import { useFontStore } from '@/store/fontStore'

export function useFonts() {
  const { fonts, loadFonts } = useFontStore()

  useEffect(() => {
    loadFonts()
  }, [loadFonts])

  useEffect(() => {
    // Inject custom fonts via FontFace API
    const injected: FontFace[] = []

    const injectFonts = async () => {
      for (const font of fonts) {
        const dataUrl = await window.electronAPI.getFontDataUrl(font.id)
        if (dataUrl) {
          const fontFace = new FontFace(font.name, `url(${dataUrl})`)
          try {
            await fontFace.load()
            document.fonts.add(fontFace)
            injected.push(fontFace)
          } catch (err) {
            console.error('Failed to load font:', font.name, err)
          }
        }
      }
    }

    injectFonts()

    return () => {
      for (const ff of injected) {
        document.fonts.delete(ff)
      }
    }
  }, [fonts])

  return { fonts }
}
