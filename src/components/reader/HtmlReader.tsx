import React, { useRef, useCallback } from 'react'
import { useHtml } from '@/hooks/useHtml'
import { useReaderStore } from '@/store/readerStore'
import { ReaderToolbar } from './ReaderToolbar'
import { BookmarkPanel } from './BookmarkPanel'
import { SearchBar } from './SearchBar'
import { Spinner } from '../shared/Spinner'
import type { Book } from '@/types/book'

interface HtmlReaderProps {
  book: Book
  onClose: () => void
}

export function HtmlReader({ book, onClose }: HtmlReaderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const {
    progress,
    isAnnotationPanelOpen,
    isSearchOpen,
    setAnnotationPanelOpen,
    setSearchOpen,
    setSearchResults,
    addBookmark,
  } = useReaderStore()

  const initialFraction = progress?.position ? parseFloat(progress.position) : 0
  const { isLoading, error, iframeSrcDoc, search } = useHtml({
    bookId: book.id,
    iframeRef,
    initialFraction,
  })

  const handleSearch = useCallback((query: string) => {
    const results = search(query)
    setSearchResults(results)
  }, [search, setSearchResults])

  const handleAddBookmark = useCallback(async () => {
    await addBookmark({
      bookId: book.id,
      position: '0',
      label: 'Bookmark',
    })
  }, [addBookmark, book.id])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Failed to load HTML</p>
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
      />

      {isSearchOpen && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={iframeSrcDoc}
              sandbox="allow-same-origin"
              className="w-full h-full border-none"
              title={book.metadata.title}
            />
          )}
        </div>

        {isAnnotationPanelOpen && (
          <div className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}>
            <BookmarkPanel
              onNavigate={() => {}}
              onClose={() => setAnnotationPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
