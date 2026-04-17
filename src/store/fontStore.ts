import { create } from 'zustand'
import type { CustomFont } from '@/types/font'
import { BUNDLED_FONT_FAMILIES, type BundledFontFamily } from '@/data/bundledFonts'

interface FontState {
  fonts: CustomFont[]
  bundledFamilies: BundledFontFamily[]
  activeBundledDataUrl: string | null
  isLoading: boolean
  fontApplying: boolean

  loadFonts: () => Promise<void>
  importFonts: () => Promise<void>
  removeFont: (fontId: string) => Promise<void>
  getFontDataUrl: (fontId: string) => Promise<string | null>
  loadBundledVariant: (familyId: string, fileName: string) => Promise<string | null>
  setFontApplying: (v: boolean) => void
}

export const useFontStore = create<FontState>((set, get) => ({
  fonts: [],
  bundledFamilies: BUNDLED_FONT_FAMILIES,
  activeBundledDataUrl: null,
  isLoading: false,
  fontApplying: false,

  setFontApplying: (v) => set({ fontApplying: v }),

  loadFonts: async () => {
    set({ isLoading: true })
    try {
      const fonts = await window.electronAPI.getAllFonts() as CustomFont[]
      set({ fonts, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  importFonts: async () => {
    set({ isLoading: true })
    try {
      const newFonts = await window.electronAPI.importFonts() as CustomFont[]
      set(state => ({
        fonts: [...state.fonts, ...newFonts],
        isLoading: false,
      }))
    } catch {
      set({ isLoading: false })
    }
  },

  removeFont: async (fontId) => {
    await window.electronAPI.deleteFont(fontId)
    set(state => ({ fonts: state.fonts.filter(f => f.id !== fontId) }))
  },

  getFontDataUrl: async (fontId) => {
    return window.electronAPI.getFontDataUrl(fontId)
  },

  loadBundledVariant: async (familyId, fileName) => {
    const dataUrl = await window.electronAPI.getBundledFontDataUrl(familyId, fileName)
    set({ activeBundledDataUrl: dataUrl })
    return dataUrl
  },
}))
