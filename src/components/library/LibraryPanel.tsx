import React, { useEffect, useState } from 'react'
import { useLibraryStore } from '@/store/libraryStore'
import { useReaderStore } from '@/store/readerStore'
import { useQuoteStore } from '@/store/quoteStore'
import { BookCard } from './BookCard'
import { LibrarySearch } from './LibrarySearch'
import { Spinner } from '../shared/Spinner'
import { MetadataModal } from '../metadata/MetadataModal'
import type { Book } from '@/types/book'

export function LibraryPanel() {
  const {
    filteredBooks,
    viewMode,
    searchQuery,
    setSearchQuery,
    isLoading,
    loadLibrary,
    removeBook,
  } = useLibraryStore()

  const { openBook } = useReaderStore()
  const { openQuoteStudio } = useQuoteStore()
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  // Load progress for all books
  useEffect(() => {
    const loadAllProgress = async () => {
      const map: Record<string, number> = {}
      for (const book of filteredBooks) {
        try {
          const progress = await window.electronAPI.getProgress(book.id) as { percentage: number } | null
          if (progress) map[book.id] = progress.percentage
        } catch {
          // ignore
        }
      }
      setProgressMap(map)
    }
    if (filteredBooks.length > 0) loadAllProgress()
  }, [filteredBooks])

  const handleOpenBook = async (book: Book) => {
    await openBook(book)
  }

  if (isLoading && filteredBooks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" />
      </div>
    )
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        {searchQuery ? (
          <>
            <svg className="w-16 h-16 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/50 font-medium">No books match "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-ink-400 text-sm mt-2 hover:underline">Clear search</button>
          </>
        ) : (
          <>
            <svg className="w-20 h-20 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-white/70 text-lg font-semibold mb-1">Your library is empty</h3>
            <p className="text-white/40 text-sm">Add EPUB, PDF, TXT, or HTML files to get started</p>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="p-4">
        <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                progress={progressMap[book.id]}
                onClick={() => handleOpenBook(book)}
                onDelete={() => removeBook(book.id)}
                onEditMetadata={() => setEditingBook(book)}
                onOpenQuote={() => openQuoteStudio('', `${book.metadata.title} — ${book.metadata.author}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all"
                onClick={() => handleOpenBook(book)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  // Could add context menu here too
                }}
              >
                {/* Small cover */}
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800">
                  {book.metadata.coverUrl ? (
                    <img src={book.metadata.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ink-800 to-ink-950 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{book.metadata.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 truncate">{book.metadata.author}</p>
                  <p className="text-white/30 text-xs mt-0.5 uppercase">{book.format}</p>
                </div>

                {progressMap[book.id] > 0 && (
                  <div className="flex-shrink-0 text-xs text-white/40">
                    {progressMap[book.id]}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingBook && (
        <MetadataModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
        />
      )}
    </>
  )
}
