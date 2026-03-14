import React, { useRef, useCallback } from 'react'
import { useTxt } from '@/hooks/useTxt'
import { useReaderStore } from '@/store/readerStore'
import { ReaderToolbar } from './ReaderToolbar'
import { BookmarkPanel } from './BookmarkPanel'
import { SearchBar } from './SearchBar'
import { Spinner } from '../shared/Spinner'
import { useSettingsStore } from '@/store/settingsStore'
import type { Book } from '@/types/book'

interface TxtReaderProps {
  book: Book
  onClose: () => void
}

export function TxtReader({ book, onClose }: TxtReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettingsStore()
  const {
    progress,
    isBookmarkPanelOpen,
    isSearchOpen,
    setBookmarkPanelOpen,
    setSearchOpen,
    setSearchResults,
    addBookmark,
  } = useReaderStore()

  const initialFraction = progress?.position ? parseFloat(progress.position) : 0
  const { isLoading, error, chunks, search } = useTxt({
    bookId: book.id,
    containerRef,
    initialFraction,
  })

  const handleSearch = useCallback((query: string) => {
    const results = search(query)
    setSearchResults(results)
  }, [search, setSearchResults])

  const handleAddBookmark = useCallback(async () => {
    if (!containerRef.current) return
    const fraction = containerRef.current.scrollTop / (containerRef.current.scrollHeight - containerRef.current.clientHeight)
    await addBookmark({
      bookId: book.id,
      position: String(fraction),
      label: `Position ${Math.round(fraction * 100)}%`,
    })
  }, [addBookmark, book.id])

  const themeBackground = settings.theme === 'dark' ? '#1a1a1a' : settings.theme === 'sepia' ? '#f4ecd8' : '#ffffff'
  const themeColor = settings.theme === 'dark' ? '#e8e8e8' : settings.theme === 'sepia' ? '#5c4b1e' : '#1a1a1a'

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Failed to load file</p>
          <p className="text-white/40 text-sm">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg text-sm">Go back</button>
        </div>
      </div>
    )
  }

  const marginPad = settings.marginSize === 'small' ? '2rem' : settings.marginSize === 'large' ? '6rem' : '4rem'

  return (
    <div className="flex flex-col h-full">
      <ReaderToolbar
        book={book}
        onClose={onClose}
        onSearch={() => setSearchOpen(!isSearchOpen)}
        onTocToggle={() => {}}
        onBookmarkToggle={() => setBookmarkPanelOpen(!isBookmarkPanelOpen)}
        onAddBookmark={handleAddBookmark}
      />

      {isSearchOpen && (
        <div className="px-4 py-2 border-b border-white/10">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: themeBackground }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <div
              className="max-w-3xl mx-auto py-12 whitespace-pre-wrap"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                color: themeColor,
                paddingLeft: marginPad,
                paddingRight: marginPad,
              }}
            >
              {chunks.join('')}
            </div>
          )}
        </div>

        {isBookmarkPanelOpen && (
          <div className="w-72 border-l border-white/10 bg-neutral-950/50 flex-shrink-0 overflow-hidden">
            <BookmarkPanel
              onNavigate={(pos) => {
                if (containerRef.current) {
                  const fraction = parseFloat(pos)
                  containerRef.current.scrollTop = fraction * (containerRef.current.scrollHeight - containerRef.current.clientHeight)
                }
              }}
              onClose={() => setBookmarkPanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
