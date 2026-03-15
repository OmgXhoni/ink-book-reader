import { useEffect, useRef, useState, useCallback } from 'react'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'

interface UseHtmlOptions {
  bookId: string
  iframeRef: React.RefObject<HTMLIFrameElement>
  initialFraction?: number
}

export function useHtml({ bookId, iframeRef, initialFraction = 0 }: UseHtmlOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawHtml, setRawHtml] = useState('')
  const { settings } = useSettingsStore()
  const { saveProgress } = useProgress(bookId)

  useEffect(() => {
    let destroyed = false

    const initHtml = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const decoder = new TextDecoder('utf-8')
        const html = decoder.decode(buffer)
        const sanitized = sanitizeHtml(html)

        if (!destroyed) {
          setRawHtml(sanitized)
          setIsLoading(false)
        }
      } catch (err) {
        if (!destroyed) {
          setError(String(err))
          setIsLoading(false)
        }
      }
    }

    initHtml()
    return () => { destroyed = true }
  }, [bookId])

  const getThemeCSS = useCallback(() => {
    const resolvedTheme = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme

    const backgrounds: Record<string, string> = {
      light: '#ffffff',
      dark: '#1a1a1a',
      sepia: '#f4ecd8',
    }
    const colors: Record<string, string> = {
      light: '#1a1a1a',
      dark: '#e8e8e8',
      sepia: '#5c4b1e',
    }

    return `
      body {
        font-family: "${settings.fontFamily}", serif;
        font-size: ${settings.fontSize}px;
        line-height: ${settings.lineHeight};
        background-color: ${backgrounds[resolvedTheme]};
        color: ${colors[resolvedTheme]};
        padding: ${settings.marginSize === 'small' ? '1rem 2rem' : settings.marginSize === 'large' ? '1rem 6rem' : '1rem 4rem'};
        max-width: 900px;
        margin: 0 auto;
      }
      img, svg, video, canvas {
        mix-blend-mode: normal;
        filter: none;
      }
    `
  }, [settings])

  // Inject CSS into iframe
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || isLoading || !rawHtml) return

    const inject = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return

        // Inject styles
        const existingStyle = doc.getElementById('ink-theme')
        const style = existingStyle || doc.createElement('style')
        style.id = 'ink-theme'
        style.textContent = getThemeCSS()
        if (!existingStyle) doc.head?.appendChild(style)

        // Track scroll
        const handleScroll = () => {
          const scrollFraction = doc.documentElement.scrollTop /
            (doc.documentElement.scrollHeight - doc.documentElement.clientHeight)
          saveProgress(String(scrollFraction), Math.round(scrollFraction * 100))
        }
        doc.addEventListener('scroll', handleScroll, { passive: true })
      } catch {
        // Cross-origin issues
      }
    }

    iframe.addEventListener('load', inject)
    return () => iframe.removeEventListener('load', inject)
  }, [rawHtml, isLoading, getThemeCSS, saveProgress]) // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback((query: string): SearchResult[] => {
    if (!rawHtml || !query.trim()) return []
    const textContent = rawHtml.replace(/<[^>]+>/g, ' ')
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const textLower = textContent.toLowerCase()
    let idx = textLower.indexOf(queryLower)

    while (idx !== -1 && results.length < 100) {
      const excerpt = textContent.slice(Math.max(0, idx - 30), idx + query.length + 30)
      results.push({
        excerpt: `...${excerpt}...`,
        index: results.length,
      })
      idx = textLower.indexOf(queryLower, idx + 1)
    }

    return results
  }, [rawHtml])

  const iframeSrcDoc = rawHtml ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${getThemeCSS()}</style>
      </head>
      <body>${rawHtml}</body>
    </html>
  ` : ''

  return {
    isLoading,
    error,
    iframeSrcDoc,
    search,
  }
}
