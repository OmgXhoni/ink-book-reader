import React, { useRef, useCallback, useEffect, useState } from 'react'
import { usePdf } from '@/hooks/usePdf'
import { useReaderStore } from '@/store/readerStore'
import { ReaderToolbar } from './ReaderToolbar'
import { AnnotationsPanel } from './AnnotationsPanel'
import { SearchBar } from './SearchBar'
import { Spinner } from '../shared/Spinner'
import type { Book } from '@/types/book'
import type { Bookmark } from '@/types/progress'

interface PdfReaderProps {
  book: Book
  onClose: () => void
}

export function PdfReader({ book, onClose }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    progress,
    bookmarks,
    isAnnotationPanelOpen,
    isSearchOpen,
    setAnnotationPanelOpen,
    setSearchOpen,
    setSearchResults,
    searchResults,
    currentSearchIndex,
    addBookmark,
    removeBookmark,
  } = useReaderStore()

  const [bookmarkToast, setBookmarkToast] = useState(false)

  const initialPage = progress?.position ? parseInt(progress.position, 10) : 1
  const { isLoading, error, currentPage, totalPages, nextPage, prevPage, goToPage, search, zoomLevel, zoomIn, zoomOut } = usePdf({
    bookId: book.id,
    containerRef,
    initialPage,
  })

  const hasBookmarkOnCurrentPage = bookmarks.some((b: Bookmark) => b.position === String(currentPage))

  const handleSearch = useCallback(async (query: string) => {
    const results = await search(query)
    setSearchResults(results)
  }, [search, setSearchResults])

  // Navigate to search result page
  useEffect(() => {
    const result = searchResults[currentSearchIndex]
    if (result?.page) goToPage(result.page)
  }, [currentSearchIndex, searchResults, goToPage])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
        requestAnimationFrame(() => {
          const input = document.querySelector<HTMLInputElement>('[data-search-input]')
          input?.focus()
        })
        return
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nextPage() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevPage() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nextPage, prevPage, setSearchOpen])

  const handleAddBookmark = useCallback(async () => {
    const existing = bookmarks.find((b: Bookmark) => b.position === String(currentPage))
    if (existing) {
      await removeBookmark(existing.id)
      return
    }
    await addBookmark({
      bookId: book.id,
      position: String(currentPage),
      label: `Page ${currentPage}`,
    })
    setBookmarkToast(true)
    setTimeout(() => setBookmarkToast(false), 1500)
  }, [addBookmark, removeBookmark, bookmarks, book.id, currentPage])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Failed to load PDF</p>
          <p className="text-white/40 text-sm">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg text-sm">Go back</button>
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
        onTocToggle={() => {}}
        onBookmarkToggle={() => setAnnotationPanelOpen(!isAnnotationPanelOpen)}
        onAddBookmark={handleAddBookmark}
        isPdf
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      {isSearchOpen && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative overflow-hidden" style={{ background: 'var(--bg-card-placeholder)' }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="w-full h-full overflow-auto"
              />

              {/* Bookmark corner indicator */}
              {hasBookmarkOnCurrentPage && (
                <div className="absolute top-0 right-0 z-10 pointer-events-none">
                  <div style={{ width: 0, height: 0, borderLeft: '32px solid transparent', borderTop: '32px solid #ef4444' }} />
                </div>
              )}

              {bookmarkToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-fade-in-out">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <svg className="w-4 h-4" fill="#ef4444" viewBox="0 0 24 24"><path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z"/></svg>
                    Bookmark added
                  </div>
                </div>
              )}

            </>
          )}
        </div>

        {isAnnotationPanelOpen && (
          <div className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}>
            <AnnotationsPanel
              onNavigate={(pos) => {
                const pageNum = pos.startsWith('pdf:page:') ? parseInt(pos.replace('pdf:page:', '')) : parseInt(pos, 10)
                if (!isNaN(pageNum)) goToPage(pageNum)
              }}
              onRemoveHighlight={() => {}}
              onClose={() => setAnnotationPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
