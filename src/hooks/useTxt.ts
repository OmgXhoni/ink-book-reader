import { useEffect, useRef, useState, useCallback } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'

const CHUNK_SIZE = 5000 // characters per chunk

interface UseTxtOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialFraction?: number
}

export function useTxt({ bookId, containerRef, initialFraction = 0 }: UseTxtOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [chunks, setChunks] = useState<string[]>([])
  const { settings } = useSettingsStore()
  const { saveProgress } = useProgress(bookId)

  useEffect(() => {
    let destroyed = false

    const initTxt = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const decoder = new TextDecoder('utf-8')
        const fullText = decoder.decode(buffer)

        if (destroyed) return

        // Chunk large files
        const newChunks: string[] = []
        for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
          newChunks.push(fullText.slice(i, i + CHUNK_SIZE))
        }

        setText(fullText)
        setChunks(newChunks)
        setIsLoading(false)

        // Restore scroll position
        if (initialFraction > 0 && containerRef.current) {
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = initialFraction * containerRef.current.scrollHeight
            }
          }, 100)
        }
      } catch (err) {
        if (!destroyed) {
          setError(String(err))
          setIsLoading(false)
        }
      }
    }

    initTxt()
    return () => { destroyed = true }
  }, [bookId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track scroll progress
  useEffect(() => {
    const container = containerRef.current
    if (!container || isLoading) return

    const handleScroll = () => {
      const fraction = container.scrollTop / (container.scrollHeight - container.clientHeight)
      const percentage = Math.round(fraction * 100)
      saveProgress(String(fraction), percentage)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isLoading, saveProgress]) // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback((query: string): SearchResult[] => {
    if (!text || !query.trim()) return []

    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    let idx = textLower.indexOf(queryLower)

    while (idx !== -1 && results.length < 100) {
      const excerpt = text.slice(Math.max(0, idx - 30), idx + query.length + 30)
      results.push({
        excerpt: `...${excerpt}...`,
        index: results.length,
      })
      idx = textLower.indexOf(queryLower, idx + 1)
    }

    return results
  }, [text])

  const fontStyle = {
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
  }

  return {
    isLoading,
    error,
    chunks,
    fontStyle,
    search,
  }
}
