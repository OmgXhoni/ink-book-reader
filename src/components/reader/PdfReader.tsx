import React, { useRef, useCallback } from 'react'
import { usePdf } from '@/hooks/usePdf'
import { useReaderStore } from '@/store/readerStore'
import { ReaderToolbar } from './ReaderToolbar'
import { BookmarkPanel } from './BookmarkPanel'
import { SearchBar } from './SearchBar'
import { PageNavigation } from './PageNavigation'
import { Spinner } from '../shared/Spinner'
import type { Book } from '@/types/book'

interface PdfReaderProps {
  book: Book
  onClose: () => void
}

export function PdfReader({ book, onClose }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    progress,
    isAnnotationPanelOpen,
    isSearchOpen,
    setAnnotationPanelOpen,
    setSearchOpen,
    setSearchResults,
    searchResults,
    currentSearchIndex,
    addBookmark,
  } = useReaderStore()

  const initialPage = progress?.position ? parseInt(progress.position, 10) : 1
  const { isLoading, error, currentPage, totalPages, nextPage, prevPage, goToPage, search } = usePdf({
    bookId: book.id,
    containerRef,
    initialPage,
  })

  const handleSearch = useCallback(async (query: string) => {
    const results = await search(query)
    setSearchResults(results)
  }, [search, setSearchResults])

  // Navigate to search result page
  React.useEffect(() => {
    const result = searchResults[currentSearchIndex]
    if (result?.page) {
      goToPage(result.page)
    }
  }, [currentSearchIndex, searchResults, goToPage])

  const handleAddBookmark = useCallback(async () => {
    await addBookmark({
      bookId: book.id,
      position: String(currentPage),
      label: `Page ${currentPage}`,
    })
  }, [addBookmark, book.id, currentPage])

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
                className="w-full h-full overflow-auto flex items-center justify-center p-6"
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <PageNavigation
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrev={prevPage}
                  onNext={nextPage}
                  onGoTo={goToPage}
                />
              </div>
            </>
          )}
        </div>

        {isAnnotationPanelOpen && (
          <div className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}>
            <BookmarkPanel
              onNavigate={(pos) => goToPage(parseInt(pos, 10))}
              onClose={() => setAnnotationPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
