import { useEffect, useRef, useState, useCallback } from 'react'
import type { Book as EpubBook, Rendition } from 'epubjs'
import { useSettingsStore } from '@/store/settingsStore'
import { useFontStore } from '@/store/fontStore'
import { useProgress } from './useProgress'
import { scaleTotalPages } from '@/utils/fontScale'
import { NATIVE_FONT } from '@/components/reader/FontSelector'
import type { SearchResult } from '@/store/readerStore'

interface UseEpubOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialCfi?: string
  onTocLoaded?: (toc: TocItem[]) => void
  onTextSelected?: (cfiRange: string, text: string, rect: { x: number; y: number }) => void
}

export interface TocItem {
  id: string
  label: string
  href: string
  subitems?: TocItem[]
}

export function useEpub({ bookId, containerRef, initialCfi, onTocLoaded, onTextSelected }: UseEpubOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const [currentCfi, setCurrentCfi] = useState<string>('')
  const bookRef = useRef<EpubBook | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const isPageTurnRef = useRef(false)
  const latestCfiRef = useRef<string>(initialCfi || '')
  const baseLocationsTotal = useRef(0)
  const onTextSelectedRef = useRef(onTextSelected)
  onTextSelectedRef.current = onTextSelected
  const { settings } = useSettingsStore()
  const { activeBundledDataUrl } = useFontStore()
  const { saveProgress } = useProgress(bookId)

  // Scale page count based on font size, font family width, and weight
  const getScaledTotal = useCallback(() => {
    return scaleTotalPages(baseLocationsTotal.current, settings.fontSize, settings.fontFamily, settings.fontWeight)
  }, [settings.fontSize, settings.fontFamily, settings.fontWeight])

  const applyTheme = useCallback((rendition: Rendition) => {
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

    const isNative = settings.fontFamily === NATIVE_FONT

    const bodyStyles: Record<string, string> = {
      'font-size': `${settings.fontSize}px !important`,
      'line-height': `${settings.lineHeight} !important`,
      'padding': settings.marginSize === 'small' ? '1rem 2rem' : settings.marginSize === 'large' ? '1rem 6rem' : '1rem 4rem',
      'background-color': `${backgrounds[resolvedTheme]} !important`,
      'color': `${colors[resolvedTheme]} !important`,
    }

    const textElements = 'p, h1, h2, h3, h4, h5, h6, span, div, li, a, em, strong, blockquote, td, th, dd, dt, figcaption, cite, pre, code'
    const textOverrides: Record<string, string> = {
      'color': 'inherit !important',
    }

    if (!isNative) {
      bodyStyles['font-family'] = `"${settings.fontFamily}", serif !important`
      textOverrides['font-family'] = 'inherit !important'
      if (settings.fontWeight) {
        bodyStyles['font-weight'] = `${settings.fontWeight} !important`
        textOverrides['font-weight'] = 'inherit !important'
      }
    }

    rendition.themes.default({
      body: bodyStyles,
      'img': {
        'mix-blend-mode': 'normal !important',
        'filter': 'none !important',
      },
      [textElements]: textOverrides,
    })

    // Inject @font-face into epub iframe for bundled/custom fonts (skip for native)
    const fontName = settings.fontFamily
    const fontFaceCSS = !isNative && activeBundledDataUrl && settings.bundledFamilyId
      ? (() => {
          const mimeType = activeBundledDataUrl.startsWith('data:font/otf') ? 'font/otf' : 'font/ttf'
          return `@font-face { font-family: "${fontName}"; src: url("${activeBundledDataUrl}") format("${mimeType === 'font/otf' ? 'opentype' : 'truetype'}"); font-display: swap; }`
        })()
      : null

    // Helper to inject/remove font style in a document
    const injectFontIntoDoc = (doc: Document) => {
      const oldStyle = doc.getElementById('ink-injected-font')
      if (oldStyle) oldStyle.remove()
      if (fontFaceCSS) {
        const style = doc.createElement('style')
        style.id = 'ink-injected-font'
        style.textContent = fontFaceCSS
        doc.head.appendChild(style)
      }
    }

    // Inject into currently displayed iframe content immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentContents = (rendition as any).getContents?.() ?? []
    for (const contents of currentContents) {
      injectFontIntoDoc(contents.document as Document)
    }

    // Also register hook for future content loads (page turns)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rendition.hooks.content.register((contents: any) => {
      injectFontIntoDoc(contents.document as Document)
    })
  }, [settings, activeBundledDataUrl])

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    const initEpub = async () => {
      setIsLoading(true)
      setError(null)
      setCurrentPage(1)
      setTotalPages(0)

      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const ePub = (await import('epubjs')).default
        const book = ePub(buffer.buffer as ArrayBuffer)
        bookRef.current = book

        await book.ready

        const isScrolled = settings.readerFlow !== 'paginated'
        const rendition = book.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          flow: isScrolled ? 'scrolled' : 'paginated',
          manager: isScrolled ? 'continuous' : 'default',
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

        // Generate locations once for stable percentage tracking
        await book.locations.generate(1024)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        baseLocationsTotal.current = (book.locations as any).total ?? 0
        const scaledTotal = getScaledTotal()
        setTotalPages(scaledTotal)

        if (isScrolled) {
          // Scrolling mode: forward wheel + arrow keys to the continuous scroll container
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rendition.hooks.content.register((contents: any) => {
            const doc = contents.document as Document
            // Forward wheel events to epubjs scroll container
            doc.addEventListener('wheel', (e: WheelEvent) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const manager = (rendition as any).manager
              const scrollEl = manager?.container as HTMLElement | undefined
              if (scrollEl) {
                scrollEl.scrollBy({ top: e.deltaY, left: e.deltaX })
              }
            }, { passive: true })
            // Arrow keys scroll the container instead of turning pages
            doc.addEventListener('keydown', (e: KeyboardEvent) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const manager = (rendition as any).manager
                const scrollEl = manager?.container as HTMLElement | undefined
                if (scrollEl) scrollEl.scrollBy({ top: 80, behavior: 'smooth' })
              }
              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const manager = (rendition as any).manager
                const scrollEl = manager?.container as HTMLElement | undefined
                if (scrollEl) scrollEl.scrollBy({ top: -80, behavior: 'smooth' })
              }
            })
          })
        } else {
          // Paginated mode: arrow keys turn pages, no scroll
          rendition.on('keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault()
              isPageTurnRef.current = true
              setCurrentPage(p => p + 1)
              rendition.next()
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault()
              isPageTurnRef.current = true
              setCurrentPage(p => Math.max(1, p - 1))
              rendition.prev()
            }
          })
        }

        // Track location changes
        rendition.on('relocated', (loc: { start: { cfi: string; displayed: { page: number; total: number } }; atStart: boolean; atEnd: boolean }) => {
          if (destroyed) return
          setCurrentCfi(loc.start.cfi)
          latestCfiRef.current = loc.start.cfi
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pct = book.locations.percentageFromCfi(loc.start.cfi) as any as number
          const pctSafe = typeof pct === 'number' && !isNaN(pct) ? pct : 0
          setPercentage(Math.round(pctSafe * 100))
          const scaledTotal = getScaledTotal()
          setTotalPages(scaledTotal)
          // For page turns, use smooth +1/-1 (already set). For jumps, compute from percentage.
          if (!isPageTurnRef.current) {
            const page = loc.atStart ? 1 : Math.max(1, Math.ceil(pctSafe * scaledTotal))
            setCurrentPage(page)
          }
          isPageTurnRef.current = false
          // Save base (unscaled) total so library can apply its own scaling
          saveProgress(loc.start.cfi, Math.round(pctSafe * 100), baseLocationsTotal.current)
        })

        // Listen for text selection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.on('selected', (cfiRange: string, contents: any) => {
          if (!onTextSelectedRef.current) return
          try {
            const selection = contents.window.getSelection()
            if (!selection || selection.isCollapsed) return
            const text = selection.toString().trim()
            if (!text) return
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            const iframe = contents.document.defaultView.frameElement as HTMLIFrameElement
            const iframeRect = iframe.getBoundingClientRect()
            onTextSelectedRef.current(cfiRange, text, {
              x: iframeRect.left + rect.left + rect.width / 2,
              y: iframeRect.top + rect.top,
            })
          } catch { /* ignore */ }
        })

        // Navigate to saved position or start — AFTER locations generated
        const resumeCfi = latestCfiRef.current || initialCfi
        if (resumeCfi) {
          await rendition.display(resumeCfi)
        } else {
          await rendition.display()
        }

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
  }, [bookId, settings.readerFlow]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (renditionRef.current) {
      applyTheme(renditionRef.current)
    }
  }, [applyTheme])

  // Update page count when font size or line height changes
  useEffect(() => {
    if (!baseLocationsTotal.current) return
    const newTotal = getScaledTotal()
    setTotalPages(newTotal)
    // Recompute current page from percentage
    const cfi = latestCfiRef.current
    const book = bookRef.current
    if (cfi && book) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pct = book.locations.percentageFromCfi(cfi) as any as number
      const pctSafe = typeof pct === 'number' && !isNaN(pct) ? pct : 0
      setCurrentPage(Math.max(1, Math.ceil(pctSafe * newTotal)))
    }
  }, [getScaledTotal])

  const nextPage = useCallback(() => {
    if (settings.readerFlow !== 'paginated') return
    isPageTurnRef.current = true
    setCurrentPage(p => p + 1)
    renditionRef.current?.next()
  }, [settings.readerFlow])

  const prevPage = useCallback(() => {
    if (settings.readerFlow !== 'paginated') return
    isPageTurnRef.current = true
    setCurrentPage(p => Math.max(1, p - 1))
    renditionRef.current?.prev()
  }, [settings.readerFlow])

  const goToCfi = useCallback((cfi: string) => {
    renditionRef.current?.display(cfi)
  }, [])

  const goToHref = useCallback((href: string) => {
    renditionRef.current?.display(href)
  }, [])

  const goToStart = useCallback(() => {
    renditionRef.current?.display()
  }, [])

  const resize = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.resize(undefined as unknown as number, undefined as unknown as number)
    }
  }, [])

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!bookRef.current || !query.trim()) return []

    const results: SearchResult[] = []
    const book = bookRef.current

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spine = book.spine as any

    // Use the spine's each() or iterate spineItems
    const spineItems: any[] = spine.spineItems ?? spine.items ?? []

    for (const section of spineItems) {
      if (results.length >= 100) break

      try {
        // Load the section document using the book's load method
        await section.load(book.load.bind(book))

        // epubjs Section has a find() method that searches text and returns CFIs
        if (typeof section.find === 'function') {
          const found = section.find(query)
          for (const match of found) {
            if (results.length >= 100) break
            results.push({
              cfi: match.cfi || undefined,
              excerpt: match.excerpt ? `...${match.excerpt}...` : query,
              index: results.length,
            })
          }
        }

        // Unload to free memory
        if (typeof section.unload === 'function') {
          section.unload()
        }
      } catch {
        // Skip sections that fail to load
      }
    }

    return results
  }, [])

  // Track search highlight CFIs so we can clear only those
  const searchHighlightCfisRef = useRef<string[]>([])

  const highlightSearchResults = useCallback((cfis: string[]) => {
    const rendition = renditionRef.current
    if (!rendition) return
    // Clear previous search highlights only
    for (const cfi of searchHighlightCfisRef.current) {
      try { rendition.annotations.remove(cfi, 'highlight') } catch { /* ignore */ }
    }
    searchHighlightCfisRef.current = []
    // Add new search highlights (yellow)
    for (const cfi of cfis) {
      if (cfi?.startsWith('epubcfi(')) {
        try {
          rendition.annotations.highlight(cfi, { type: 'search' }, () => {}, 'search-highlight', {
            'fill': '#f87171',
            'fill-opacity': '0.4',
            'mix-blend-mode': 'multiply',
          })
          searchHighlightCfisRef.current.push(cfi)
        } catch { /* ignore invalid CFIs */ }
      }
    }
  }, [])

  const clearSearchHighlights = useCallback(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    for (const cfi of searchHighlightCfisRef.current) {
      try { rendition.annotations.remove(cfi, 'highlight') } catch { /* ignore */ }
    }
    searchHighlightCfisRef.current = []
  }, [])

  const HIGHLIGHT_COLORS: Record<string, string> = {
    yellow: '#fbbf24',
    blue: '#93c5fd',
    green: '#86efac',
    pink: '#f9a8d4',
  }

  // Track all active user highlight CFIs for reliable removal
  const userHighlightCfisRef = useRef<Set<string>>(new Set())

  const clearAllUserHighlights = useCallback(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    for (const cfi of userHighlightCfisRef.current) {
      try { rendition.annotations.remove(cfi, 'highlight') } catch { /* ignore */ }
    }
    // Also brute-force remove any remaining user highlights from the annotations map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const annotations = (rendition as any).annotations
    if (annotations?._annotations) {
      for (const key of Object.keys(annotations._annotations)) {
        const ann = annotations._annotations[key]
        if (ann?.data?.type === 'user') {
          try { rendition.annotations.remove(key, 'highlight') } catch { /* ignore */ }
        }
      }
    }
    userHighlightCfisRef.current.clear()
  }, [])

  const applyUserHighlights = useCallback((highlights: Array<{ cfiRange: string; color: string }>) => {
    const rendition = renditionRef.current
    if (!rendition) return
    // Clear existing user highlights first to avoid duplicates
    clearAllUserHighlights()
    for (const h of highlights) {
      const fill = HIGHLIGHT_COLORS[h.color] || HIGHLIGHT_COLORS.yellow
      try {
        rendition.annotations.highlight(h.cfiRange, { type: 'user', color: h.color }, () => {}, `user-highlight-${h.color}`, {
          'fill': fill,
          'fill-opacity': '0.35',
          'mix-blend-mode': 'multiply',
        })
        userHighlightCfisRef.current.add(h.cfiRange)
      } catch { /* ignore */ }
    }
  }, [clearAllUserHighlights])

  const addUserHighlight = useCallback((cfiRange: string, color: string) => {
    const rendition = renditionRef.current
    if (!rendition) return
    const fill = HIGHLIGHT_COLORS[color] || HIGHLIGHT_COLORS.yellow
    try {
      rendition.annotations.highlight(cfiRange, { type: 'user', color }, () => {}, `user-highlight-${color}`, {
        'fill': fill,
        'fill-opacity': '0.35',
        'mix-blend-mode': 'multiply',
      })
      userHighlightCfisRef.current.add(cfiRange)
    } catch { /* ignore */ }
  }, [])

  const removeUserHighlight = useCallback((cfiRange: string) => {
    const rendition = renditionRef.current
    if (!rendition) return
    try { rendition.annotations.remove(cfiRange, 'highlight') } catch { /* ignore */ }
    userHighlightCfisRef.current.delete(cfiRange)
    // If epubjs remove didn't work, force clear and re-apply all except this one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const annotations = (rendition as any).annotations
    if (annotations?._annotations?.[cfiRange]) {
      // Still there — nuclear option: clear all and re-apply
      const remaining = Array.from(userHighlightCfisRef.current)
      clearAllUserHighlights()
      // Re-apply will be triggered by the store update in EpubReader
    }
  }, [clearAllUserHighlights])

  /** Search for exact text in the book and return its CFI range. Used as fallback for highlight splitting. */
  const findTextCfi = useCallback(async (text: string): Promise<string | null> => {
    if (!bookRef.current || !text.trim()) return null
    const book = bookRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spine = book.spine as any
    const spineItems: any[] = spine.spineItems ?? spine.items ?? []

    for (const section of spineItems) {
      try {
        await section.load(book.load.bind(book))
        if (typeof section.find === 'function') {
          const found = section.find(text.trim())
          if (found.length > 0 && found[0].cfi) {
            if (typeof section.unload === 'function') section.unload()
            return found[0].cfi as string
          }
        }
        if (typeof section.unload === 'function') section.unload()
      } catch { /* skip */ }
    }
    return null
  }, [])

  return {
    isLoading,
    error,
    currentPage,
    totalPages,
    percentage,
    currentCfi,
    nextPage,
    prevPage,
    goToCfi,
    goToHref,
    goToStart,
    search,
    resize,
    highlightSearchResults,
    clearSearchHighlights,
    addUserHighlight,
    removeUserHighlight,
    applyUserHighlights,
    findTextCfi,
    getRendition: () => renditionRef.current,
  }
}
