import { useEffect, useRef } from 'react'
import { useFontStore } from '@/store/fontStore'
import { useSettingsStore } from '@/store/settingsStore'
import { BUNDLED_FONT_FAMILIES } from '@/data/bundledFonts'

export function useFonts() {
  const { fonts, loadFonts, loadBundledVariant } = useFontStore()
  const { settings } = useSettingsStore()
  const activeFontFaceRef = useRef<FontFace | null>(null)

  useEffect(() => {
    loadFonts()
  }, [loadFonts])

  // Inject custom (user-imported) fonts
  useEffect(() => {
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

  // Load active bundled font variant
  useEffect(() => {
    if (!settings.bundledFamilyId) return

    const family = BUNDLED_FONT_FAMILIES.find(f => f.id === settings.bundledFamilyId)
    if (!family) return

    const variant = family.variants.find(v => v.label === settings.fontVariant) || family.variants[0]
    if (!variant) return

    let cancelled = false

    const load = async () => {
      const dataUrl = await loadBundledVariant(family.id, variant.fileName)
      if (cancelled || !dataUrl) return

      // Remove previously injected bundled font
      if (activeFontFaceRef.current) {
        document.fonts.delete(activeFontFaceRef.current)
        activeFontFaceRef.current = null
      }

      // For variable fonts, register with full weight range
      const descriptors: FontFaceDescriptors = {
        style: variant.style,
      }
      if (family.isVariable && family.variableFiles) {
        descriptors.weight = `${family.variableFiles.weightRange[0]} ${family.variableFiles.weightRange[1]}`
      } else {
        descriptors.weight = String(variant.weight)
      }

      const fontFace = new FontFace(family.name, `url(${dataUrl})`, descriptors)
      try {
        await fontFace.load()
        if (cancelled) return
        document.fonts.add(fontFace)
        activeFontFaceRef.current = fontFace
      } catch (err) {
        console.error('Failed to load bundled font:', family.name, variant.label, err)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [settings.bundledFamilyId, settings.fontVariant, loadBundledVariant])

  return { fonts }
}
