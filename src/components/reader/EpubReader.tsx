import React, { useRef, useState, useCallback } from 'react'
import { useEpub, type TocItem } from '@/hooks/useEpub'
import { useReaderStore } from '@/store/readerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ReaderToolbar } from './ReaderToolbar'
import { TocPanel } from './TocPanel'
import { BookmarkPanel } from './BookmarkPanel'
import { SearchBar } from './SearchBar'
import { PageNavigation } from './PageNavigation'
import { Spinner } from '../shared/Spinner'
import type { Book } from '@/types/book'

interface EpubReaderProps {
  book: Book
  onClose: () => void
}

export function EpubReader({ book, onClose }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const { settings } = useSettingsStore()
  const {
    progress,
    isTocOpen,
    isBookmarkPanelOpen,
    isSearchOpen,
    setTocOpen,
    setBookmarkPanelOpen,
    setSearchOpen,
    setSearchResults,
    searchResults,
    currentSearchIndex,
    addBookmark,
    currentSearchIndex: resultIndex,
  } = useReaderStore()

  const { isLoading, error, currentPage, totalPages, nextPage, prevPage, goToCfi, goToHref, search } = useEpub({
    bookId: book.id,
    containerRef,
    initialCfi: progress?.position,
    onTocLoaded: setToc,
  })

  const handleSearch = useCallback(async (query: string) => {
    const results = await search(query)
    setSearchResults(results)
  }, [search, setSearchResults])

  // Navigate to current search result
  React.useEffect(() => {
    const result = searchResults[currentSearchIndex]
    if (result?.cfi) {
      goToCfi(result.cfi)
    }
  }, [currentSearchIndex, searchResults, goToCfi])

  const handleAddBookmark = useCallback(async () => {
    await addBookmark({
      bookId: book.id,
      position: progress?.position || '',
      label: `Page ${currentPage}`,
      excerpt: undefined,
    })
  }, [addBookmark, book.id, progress?.position, currentPage])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Failed to load EPUB</p>
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
        onTocToggle={() => setTocOpen(!isTocOpen)}
        onBookmarkToggle={() => setBookmarkPanelOpen(!isBookmarkPanelOpen)}
        onAddBookmark={handleAddBookmark}
      />

      {isSearchOpen && (
        <div className="px-4 py-2 border-b border-white/10">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* TOC panel */}
        {isTocOpen && (
          <div className="w-72 border-r border-white/10 bg-neutral-950/50 flex-shrink-0 overflow-hidden">
            <TocPanel toc={toc} onNavigate={goToHref} onClose={() => setTocOpen(false)} />
          </div>
        )}

        {/* Main reader area */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-white/40 text-sm mt-3">Loading book...</p>
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />

          {/* Page navigation overlay */}
          {settings.readerFlow === 'paginated' && !isLoading && totalPages > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <PageNavigation
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={prevPage}
                onNext={nextPage}
              />
            </div>
          )}

          {/* Keyboard navigation */}
          <div
            tabIndex={0}
            className="absolute inset-0 outline-none"
            onKeyDown={e => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage()
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevPage()
              if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                setSearchOpen(true)
              }
            }}
          />
        </div>

        {/* Bookmark panel */}
        {isBookmarkPanelOpen && (
          <div className="w-72 border-l border-white/10 bg-neutral-950/50 flex-shrink-0 overflow-hidden">
            <BookmarkPanel
              onNavigate={goToCfi}
              onClose={() => setBookmarkPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
