import { useEffect, useRef, useState, useCallback } from 'react'
import type { Book as EpubBook, Rendition } from 'epubjs'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'

interface UseEpubOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialCfi?: string
  onTocLoaded?: (toc: TocItem[]) => void
}

export interface TocItem {
  id: string
  label: string
  href: string
  subitems?: TocItem[]
}

export function useEpub({ bookId, containerRef, initialCfi, onTocLoaded }: UseEpubOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [currentCfi, setCurrentCfi] = useState<string>('')
  const bookRef = useRef<EpubBook | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const { settings } = useSettingsStore()
  const { saveProgress } = useProgress(bookId)

  const applyTheme = useCallback((rendition: Rendition) => {
    const themeStyles: Record<string, string> = {
      light: 'background-color: #ffffff; color: #1a1a1a;',
      dark: 'background-color: #1a1a1a; color: #e8e8e8;',
      sepia: 'background-color: #f4ecd8; color: #5c4b1e;',
      system: '',
    }

    rendition.themes.default({
      body: {
        'font-family': `"${settings.fontFamily}", serif !important`,
        'font-size': `${settings.fontSize}px !important`,
        'line-height': `${settings.lineHeight} !important`,
        'padding': settings.marginSize === 'small' ? '1rem 2rem' : settings.marginSize === 'large' ? '1rem 6rem' : '1rem 4rem',
      },
    })

    if (settings.theme !== 'system') {
      rendition.themes.default({
        body: themeStyles[settings.theme],
      })
    }
  }, [settings])

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    const initEpub = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const ePub = (await import('epubjs')).default
        const book = ePub(buffer.buffer as ArrayBuffer)
        bookRef.current = book

        await book.ready

        const rendition = book.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          flow: settings.readerFlow === 'paginated' ? 'paginated' : 'scrolled',
          spread: 'none',
        })
        renditionRef.current = rendition

        applyTheme(rendition)

        // Load TOC
        const nav = await book.loaded.navigation
        if (nav?.toc && onTocLoaded) {
          const mapToc = (items: unknown[]): TocItem[] =>
            (items as Array<{ id: string; label: string; href: string; subitems?: unknown[] }>).map(item => ({
              id: item.id,
              label: item.label,
              href: item.href,
              subitems: item.subitems ? mapToc(item.subitems) : undefined,
            }))
          onTocLoaded(mapToc(nav.toc))
        }

        // Navigate to saved position or start
        if (initialCfi) {
          await rendition.display(initialCfi)
        } else {
          await rendition.display()
        }

        // Track location changes
        rendition.on('locationChanged', (loc: { start: { cfi: string }; percentage: number }) => {
          if (destroyed) return
          setCurrentCfi(loc.start.cfi)
          saveProgress(loc.start.cfi, Math.round(loc.percentage * 100))
        })

        // Page count
        await book.locations.generate(1024)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTotalPages((book.locations as any).total ?? 0)

        if (!destroyed) setIsLoading(false)
      } catch (err) {
        if (!destroyed) {
          setError(String(err))
          setIsLoading(false)
        }
      }
    }

    initEpub()

    return () => {
      destroyed = true
      renditionRef.current?.destroy()
      bookRef.current?.destroy()
      bookRef.current = null
      renditionRef.current = null
    }
  }, [bookId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (renditionRef.current) {
      applyTheme(renditionRef.current)
    }
  }, [applyTheme])

  const nextPage = useCallback(() => {
    renditionRef.current?.next()
    setCurrentPage(p => p + 1)
  }, [])

  const prevPage = useCallback(() => {
    renditionRef.current?.prev()
    setCurrentPage(p => Math.max(1, p - 1))
  }, [])

  const goToCfi = useCallback((cfi: string) => {
    renditionRef.current?.display(cfi)
  }, [])

  const goToHref = useCallback((href: string) => {
    renditionRef.current?.display(href)
  }, [])

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!bookRef.current || !query.trim()) return []

    const results: SearchResult[] = []
    const book = bookRef.current

    // Search through book spine
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((book.spine as any).spineItems ?? (book.spine as any).items ?? []).map(async (item: any) => {
        const doc = await item.load(book.load.bind(book)) as Document | null
        if (!doc) return

        const text = doc.body?.textContent || ''
        const queryLower = query.toLowerCase()
        let idx = text.toLowerCase().indexOf(queryLower)

        while (idx !== -1 && results.length < 100) {
          const excerpt = text.slice(Math.max(0, idx - 30), idx + query.length + 30)
          results.push({
            excerpt: `...${excerpt}...`,
            index: results.length,
          })
          idx = text.toLowerCase().indexOf(queryLower, idx + 1)
        }
      })
    )

    return results
  }, [])

  return {
    isLoading,
    error,
    currentPage,
    totalPages,
    currentCfi,
    nextPage,
    prevPage,
    goToCfi,
    goToHref,
    search,
  }
}
