import { create } from 'zustand'
import type { CustomFont } from '@/types/font'

interface FontState {
  fonts: CustomFont[]
  isLoading: boolean

  loadFonts: () => Promise<void>
  importFonts: () => Promise<void>
  removeFont: (fontId: string) => Promise<void>
  getFontDataUrl: (fontId: string) => Promise<string | null>
}

export const useFontStore = create<FontState>((set, get) => ({
  fonts: [],
  isLoading: false,

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
}))
