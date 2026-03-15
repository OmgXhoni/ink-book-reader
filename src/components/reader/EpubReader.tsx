import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useEpub, type TocItem } from '@/hooks/useEpub'
import { useReaderStore } from '@/store/readerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ReaderToolbar } from './ReaderToolbar'
import { TocPanel } from './TocPanel'
import { AnnotationsPanel } from './AnnotationsPanel'
import { HighlightPopup } from './HighlightPopup'
import { SearchBar } from './SearchBar'
import { PageNavigation } from './PageNavigation'
import type { Book } from '@/types/book'
import type { Bookmark, Highlight, HighlightColor } from '@/types/progress'

interface EpubReaderProps {
  book: Book
  onClose: () => void
}

/** Normalize whitespace for text comparison */
function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Extract the section/spine identifier from a CFI (the part before '!') */
function getCfiSection(cfi: string): string {
  const match = cfi.match(/epubcfi\(([^!]+)!/)
  return match?.[1] || ''
}

/** Parse a CFI range into base + start + end parts */
function parseCfiRange(cfi: string): { base: string; start: string; end: string } | null {
  const inner = cfi.slice('epubcfi('.length, -1)
  const firstComma = inner.indexOf(',')
  if (firstComma === -1) return null
  const rest = inner.slice(firstComma + 1)
  const secondComma = rest.indexOf(',')
  if (secondComma === -1) return null
  return {
    base: inner.slice(0, firstComma),
    start: rest.slice(0, secondComma),
    end: rest.slice(secondComma + 1),
  }
}

/** Build a CFI range string from parts */
function buildCfiRange(base: string, start: string, end: string): string {
  return `epubcfi(${base},${start},${end})`
}

/** Find highlights that overlap with the given selection by checking same-section + text overlap */
function findOverlappingHighlights(cfiRange: string, text: string, highlights: Highlight[]): Highlight[] {
  const section = getCfiSection(cfiRange)
  if (!section || !text) return []
  const normText = normalizeText(text)

  return highlights.filter(h => {
    // Must be in the same section of the book
    if (getCfiSection(h.cfiRange) !== section) return false
    // Check text overlap with normalized whitespace
    const normH = normalizeText(h.text)
    return normText.includes(normH) || normH.includes(normText)
  })
}

/**
 * Split a highlight around a selection, returning remaining portions.
 * If selection covers the entire highlight or CFIs can't be parsed, returns empty array.
 */
function splitHighlightAroundSelection(
  originalCfi: string,
  originalText: string,
  selectionCfi: string,
  selectionText: string,
): { cfiRange: string; text: string }[] {
  const orig = parseCfiRange(originalCfi)
  const sel = parseCfiRange(selectionCfi)
  if (!orig || !sel) return []

  // Bases must match exactly — start/end parts are relative to the base,
  // so mixing parts from different bases produces invalid CFIs
  if (orig.base !== sel.base) return []

  // Find where the selection text sits within the original text (normalized)
  const normOrig = normalizeText(originalText)
  const normSel = normalizeText(selectionText)
  const selIdx = normOrig.indexOf(normSel)
  if (selIdx === -1) return []

  // If the selection covers the full original text, nothing remains
  if (normSel === normOrig) return []

  // Use the selection's base for building CFIs since both are in the same section
  // The selection CFI parts are authoritative for the split points
  const results: { cfiRange: string; text: string }[] = []

  // Before portion: original start → selection start
  if (selIdx > 0) {
    const beforeText = normOrig.slice(0, selIdx).trim()
    if (beforeText) {
      results.push({
        cfiRange: buildCfiRange(orig.base, orig.start, sel.start),
        text: beforeText,
      })
    }
  }

  // After portion: selection end → original end
  if (selIdx + normSel.length < normOrig.length) {
    const afterText = normOrig.slice(selIdx + normSel.length).trim()
    if (afterText) {
      results.push({
        cfiRange: buildCfiRange(orig.base, sel.end, orig.end),
        text: afterText,
      })
    }
  }

  return results
}

export function EpubReader({ book, onClose }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const { settings } = useSettingsStore()
  const {
    progress,
    bookmarks,
    highlights,
    isTocOpen,
    isAnnotationPanelOpen,
    isSearchOpen,
    setTocOpen,
    setAnnotationPanelOpen,
    setSearchOpen,
    setSearchResults,
    searchResults,
    currentSearchIndex,
    addBookmark,
    addHighlight,
    removeHighlight,
  } = useReaderStore()

  const [bookmarkToast, setBookmarkToast] = useState(false)
  const [highlightPopup, setHighlightPopup] = useState<{ x: number; y: number; cfiRange: string; text: string; overlappingIds?: string[] } | null>(null)

  const handleTextSelected = useCallback((cfiRange: string, text: string, rect: { x: number; y: number }) => {
    const allHighlights = useReaderStore.getState().highlights
    const overlapping = findOverlappingHighlights(cfiRange, text, allHighlights)
    setHighlightPopup({
      x: rect.x,
      y: rect.y,
      cfiRange,
      text,
      overlappingIds: overlapping.length > 0 ? overlapping.map(h => h.id) : undefined,
    })
  }, [])

  const {
    isLoading, error, currentPage, totalPages, percentage, currentCfi,
    nextPage, prevPage, goToCfi, goToHref, goToStart, search,
    highlightSearchResults, clearSearchHighlights,
    applyUserHighlights,
    getRendition,
  } = useEpub({
    bookId: book.id,
    containerRef,
    initialCfi: progress?.position,
    onTocLoaded: setToc,
    onTextSelected: handleTextSelected,
  })

  // Check if current page has a bookmark
  const hasBookmarkOnCurrentPage = bookmarks.length > 0 && currentCfi && bookmarks.some(
    (b: Bookmark) => b.position && currentCfi && b.position === currentCfi
  )

  const handleSearch = useCallback(async (query: string) => {
    const results = await search(query)
    setSearchResults(results)
    const cfis = results.map(r => r.cfi).filter((c): c is string => !!c)
    highlightSearchResults(cfis)
  }, [search, setSearchResults, highlightSearchResults])

  // Navigate to current search result
  useEffect(() => {
    const result = searchResults[currentSearchIndex]
    if (result?.cfi) {
      if (result.cfi.startsWith('epubcfi(')) {
        goToCfi(result.cfi)
      } else {
        goToHref(result.cfi)
      }
    }
  }, [currentSearchIndex, searchResults, goToCfi, goToHref])

  // Clear search highlights when search is closed
  useEffect(() => {
    if (!isSearchOpen) {
      clearSearchHighlights()
    }
  }, [isSearchOpen, clearSearchHighlights])

  // Apply user highlights when they change or on initial load
  useEffect(() => {
    if (!isLoading) {
      applyUserHighlights(highlights.map(h => ({ cfiRange: h.cfiRange, color: h.color })))
    }
  }, [isLoading, highlights, applyUserHighlights])

  const clearIframeSelection = useCallback(() => {
    const rendition = getRendition()
    if (rendition) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const manager = (rendition as any).manager
      if (manager?.container) {
        const iframe = manager.container.querySelector('iframe')
        if (iframe?.contentWindow) {
          iframe.contentWindow.getSelection()?.removeAllRanges()
        }
      }
    }
  }, [getRendition])

  /** Minimum character length for a remaining highlight portion to be worth keeping */
  const MIN_REMAINING_LENGTH = 3

  /**
   * Split an overlapping highlight and re-create the remaining portions.
   * Only works when the original and selection share the same CFI base path.
   * Discards remaining portions shorter than MIN_REMAINING_LENGTH.
   */
  const splitAndPreserveRemaining = useCallback(async (
    original: Highlight,
    selectionCfi: string,
    selectionText: string,
  ) => {
    const remaining = splitHighlightAroundSelection(
      original.cfiRange, original.text, selectionCfi, selectionText,
    ).filter(p => p.text.length >= MIN_REMAINING_LENGTH)

    for (const part of remaining) {
      await addHighlight({
        bookId: book.id, cfiRange: part.cfiRange, text: part.text, color: original.color,
      })
    }
  }, [addHighlight, book.id])

  const handleHighlightColor = useCallback(async (color: HighlightColor) => {
    if (!highlightPopup) return
    const currentHighlights = useReaderStore.getState().highlights
    const overlapping = findOverlappingHighlights(highlightPopup.cfiRange, highlightPopup.text, currentHighlights)
    const normSel = normalizeText(highlightPopup.text)

    if (overlapping.length === 0) {
      // No overlap: simple new highlight
      await addHighlight({
        bookId: book.id, cfiRange: highlightPopup.cfiRange, text: highlightPopup.text, color,
      })
    } else {
      // Track whether we still need to create the selection as a new highlight
      let createSelectionHighlight = true

      for (const h of overlapping) {
        const normH = normalizeText(h.text)

        if (normH === normSel) {
          // EXACT MATCH
          if (h.color === color) {
            createSelectionHighlight = false // Already highlighted in same color
          } else {
            // Change color: remove old, new one created below
            await removeHighlight(h.id)
          }
        } else if (normSel.includes(normH)) {
          // Selection FULLY CONTAINS this highlight → overwrite it
          // Remove the old highlight; the new selection highlight replaces it
          await removeHighlight(h.id)
        } else if (normH.includes(normSel)) {
          // Selection is WITHIN the existing highlight
          if (h.color === color) {
            createSelectionHighlight = false // Already covered
          } else {
            // Split the original, keep non-selected portions in original color
            await removeHighlight(h.id)
            await splitAndPreserveRemaining(h, highlightPopup.cfiRange, highlightPopup.text)
          }
        }
      }

      if (createSelectionHighlight) {
        await addHighlight({
          bookId: book.id, cfiRange: highlightPopup.cfiRange, text: highlightPopup.text, color,
        })
      }
    }

    setHighlightPopup(null)
    clearIframeSelection()
  }, [highlightPopup, addHighlight, removeHighlight, book.id, clearIframeSelection, splitAndPreserveRemaining])

  const handleRemoveHighlightFromPopup = useCallback(async () => {
    if (!highlightPopup?.overlappingIds?.length) return
    const currentHighlights = useReaderStore.getState().highlights

    for (const id of highlightPopup.overlappingIds) {
      const original = currentHighlights.find(h => h.id === id)
      if (!original) continue

      const normOrig = normalizeText(original.text)
      const normSel = normalizeText(highlightPopup.text)

      await removeHighlight(id)

      if (normOrig === normSel || normSel.includes(normOrig)) {
        // Selection covers the entire highlight — just remove, no splitting needed
      } else if (normOrig.includes(normSel)) {
        // Selection is within the highlight — split and preserve remaining
        await splitAndPreserveRemaining(original, highlightPopup.cfiRange, highlightPopup.text)
      }
    }

    setHighlightPopup(null)
    clearIframeSelection()
  }, [highlightPopup, removeHighlight, splitAndPreserveRemaining, clearIframeSelection])

  /** Remove entire highlight from annotations panel — no splitting */
  const handleRemoveHighlight = useCallback(async (highlightId: string, _cfiRange: string) => {
    await removeHighlight(highlightId)
  }, [removeHighlight])

  // Global keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      // Paginated mode: arrow keys turn pages
      if (settings.readerFlow === 'paginated') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          nextPage()
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          prevPage()
        }
      }
      // Scrolling mode: arrow keys are handled inside the iframe (scrollBy), no action needed here
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nextPage, prevPage, setSearchOpen, settings.readerFlow])


  const handleAddBookmark = useCallback(async () => {
    await addBookmark({
      bookId: book.id,
      position: currentCfi || progress?.position || '',
      label: `Page ${currentPage}`,
      excerpt: undefined,
    })
    setBookmarkToast(true)
    setTimeout(() => setBookmarkToast(false), 1500)
  }, [addBookmark, book.id, currentCfi, progress?.position, currentPage])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Failed to load EPUB</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ReaderToolbar
        book={book}
        onClose={onClose}
        onSearch={() => setSearchOpen(!isSearchOpen)}
        onTocToggle={() => setTocOpen(!isTocOpen)}
        onBookmarkToggle={() => setAnnotationPanelOpen(!isAnnotationPanelOpen)}
        onAddBookmark={handleAddBookmark}
      />

      {isSearchOpen && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* TOC panel */}
        <div
          className="absolute top-0 left-0 h-full z-30 transition-transform duration-200 ease-in-out shadow-2xl"
          style={{
            width: '288px',
            transform: isTocOpen ? 'translateX(0)' : 'translateX(-100%)',
            borderRight: '1px solid var(--border-color)',
            background: 'var(--bg-app)',
          }}
        >
          <TocPanel toc={toc} onNavigate={(href) => { goToHref(href); setTocOpen(false) }} onClose={() => setTocOpen(false)} />
        </div>

        {isTocOpen && (
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setTocOpen(false)} />
        )}

        {/* Main reader area */}
        <div className="w-full h-full relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--bg-app)' }}>
              <div className="flex flex-col items-center w-64">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full animate-loading-bar" style={{ background: 'var(--text-muted)', width: '40%' }} />
                </div>
                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Loading book...</p>
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />

          {/* Red bookmark corner indicator */}
          {hasBookmarkOnCurrentPage && (
            <div className="absolute top-0 right-0 z-10 pointer-events-none">
              <div style={{ width: 0, height: 0, borderLeft: '32px solid transparent', borderTop: '32px solid #ef4444' }} />
            </div>
          )}

          {/* Bookmark added toast */}
          {bookmarkToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-fade-in-out">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <svg className="w-4 h-4" fill="#ef4444" viewBox="0 0 24 24"><path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z"/></svg>
                Bookmark added
              </div>
            </div>
          )}

          {/* Page navigation */}
          {settings.readerFlow === 'paginated' && !isLoading && totalPages > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <PageNavigation currentPage={currentPage} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} />
            </div>
          )}
        </div>

        {/* Annotations panel backdrop */}
        {isAnnotationPanelOpen && !isTocOpen && (
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setAnnotationPanelOpen(false)} />
        )}

        {/* Annotations panel */}
        <div
          className="absolute top-0 right-0 h-full z-30 transition-transform duration-200 ease-in-out shadow-2xl"
          style={{
            width: '288px',
            transform: isAnnotationPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-app)',
          }}
        >
          <AnnotationsPanel
            onNavigate={goToCfi}
            onRemoveHighlight={handleRemoveHighlight}
            onClose={() => setAnnotationPanelOpen(false)}
          />
        </div>
      </div>

      {/* Highlight color popup */}
      {highlightPopup && (
        <HighlightPopup
          position={{ x: highlightPopup.x, y: highlightPopup.y }}
          onSelect={handleHighlightColor}
          onClose={() => setHighlightPopup(null)}
          onRemove={highlightPopup.overlappingIds?.length ? handleRemoveHighlightFromPopup : undefined}
        />
      )}
    </div>
  )
}
