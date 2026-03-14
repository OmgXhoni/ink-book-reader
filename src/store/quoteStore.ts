import { create } from 'zustand'
import type { QuoteConfig, AspectRatio } from '@/types/quote'
import { ASPECT_RATIOS } from '@/types/quote'

const defaultConfig: QuoteConfig = {
  text: '',
  attribution: '',
  background: { type: 'color', value: '#1a1a2e' },
  textStyle: {
    fontFamily: 'Georgia',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'italic',
    lineHeight: 1.5,
    shadow: true,
  },
  canvasWidth: 1080,
  canvasHeight: 1080,
  padding: 80,
  showQuoteMark: true,
  template: 'minimal',
}

interface QuoteState {
  isOpen: boolean
  config: QuoteConfig
  aspectRatio: AspectRatio
  customBackgroundUrl: string | null

  openQuoteStudio: (text?: string, attribution?: string) => void
  closeQuoteStudio: () => void
  updateConfig: (partial: Partial<QuoteConfig>) => void
  setAspectRatio: (ratio: AspectRatio) => void
  setCustomBackground: (url: string | null) => void
  exportImage: (dataUrl: string) => Promise<string | null>
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  isOpen: false,
  config: defaultConfig,
  aspectRatio: '1:1',
  customBackgroundUrl: null,

  openQuoteStudio: (text = '', attribution = '') => {
    set(state => ({
      isOpen: true,
      config: {
        ...state.config,
        text,
        attribution,
      },
    }))
  },

  closeQuoteStudio: () => set({ isOpen: false }),

  updateConfig: (partial) => {
    set(state => ({ config: { ...state.config, ...partial } }))
  },

  setAspectRatio: (ratio) => {
    const { width, height } = ASPECT_RATIOS[ratio]
    set(state => ({
      aspectRatio: ratio,
      config: {
        ...state.config,
        canvasWidth: width,
        canvasHeight: height,
      },
    }))
  },

  setCustomBackground: (url) => {
    set(state => ({
      customBackgroundUrl: url,
      config: {
        ...state.config,
        background: url ? { type: 'image', url, blur: 0, opacity: 0.5 } : { type: 'color', value: '#1a1a2e' },
      },
    }))
  },

  exportImage: async (dataUrl) => {
    const { config } = get()
    const filename = `ink-quote-${config.canvasWidth}x${config.canvasHeight}`
    return window.electronAPI.saveImage(dataUrl, filename)
  },
}))
