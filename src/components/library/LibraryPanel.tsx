import React, { useEffect, useMemo, useState } from 'react'
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
    filterMode,
    isLoading,
    loadLibrary,
    removeBook,
  } = useLibraryStore()

  const { openBook, activeBook, livePercentage, liveTotalPages } = useReaderStore()
  const { openQuoteStudio } = useQuoteStore()
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, { percentage: number; totalPages?: number }>>({})

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary, activeBook])

  // Load progress for all books — refresh when returning from reading (activeBook becomes null)
  useEffect(() => {
    const loadAllProgress = async () => {
      const map: Record<string, { percentage: number; totalPages?: number }> = {}
      for (const book of filteredBooks) {
        try {
          const progress = await window.electronAPI.getProgress(book.id) as { percentage: number; totalPages?: number } | null
          if (progress) map[book.id] = { percentage: progress.percentage, totalPages: progress.totalPages }
        } catch {
          // ignore
        }
      }
      setProgressMap(map)
    }
    if (filteredBooks.length > 0) loadAllProgress()
  }, [filteredBooks, activeBook])

  // Merge live progress for the active book into the progress map
  const effectiveProgressMap = useMemo(() => {
    if (!activeBook) return progressMap
    return {
      ...progressMap,
      [activeBook.id]: { percentage: livePercentage, totalPages: liveTotalPages },
    }
  }, [progressMap, activeBook, livePercentage, liveTotalPages])

  // Apply filter mode on top of text-search filtered books
  const displayBooks = useMemo(() => {
    let books = [...filteredBooks]
    switch (filterMode) {
      case 'recents':
        return books
          .filter(b => b.lastOpened)
          .sort((a, b) => new Date(b.lastOpened!).getTime() - new Date(a.lastOpened!).getTime())
      case 'new':
        return books.filter(b => !b.lastOpened)
      case 'inProgress': {
        return books.filter(b => {
          const pct = effectiveProgressMap[b.id]?.percentage
          return b.lastOpened && pct != null && pct > 0 && pct < 100
        })
      }
      case 'finished':
        return books.filter(b => effectiveProgressMap[b.id]?.percentage >= 100)
      case 'length':
        return books.sort((a, b) => {
          const aPages = effectiveProgressMap[a.id]?.totalPages ?? 0
          const bPages = effectiveProgressMap[b.id]?.totalPages ?? 0
          return bPages - aPages
        })
      case 'titleAZ':
        return books.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
      case 'authorAZ':
        return books.sort((a, b) => a.metadata.author.localeCompare(b.metadata.author))
      case 'all':
      default:
        return books
    }
  }, [filteredBooks, filterMode, effectiveProgressMap])

  const handleOpenBook = async (book: Book) => {
    await openBook(book)
  }

  const { closeBook } = useReaderStore()

  const handleResetBook = async (bookId: string) => {
    // If this book is currently open, close the reader first
    if (activeBook?.id === bookId) {
      closeBook()
    }
    await window.electronAPI.resetBook(bookId)
    await loadLibrary()
    setProgressMap(prev => {
      const next = { ...prev }
      delete next[bookId]
      return next
    })
  }

  const handleSetFinished = async (bookId: string) => {
    if (activeBook?.id === bookId) {
      closeBook()
    }
    await window.electronAPI.saveProgress(bookId, {
      bookId,
      position: '',
      percentage: 100,
      lastRead: new Date().toISOString(),
    })
    await window.electronAPI.updateLastOpened(bookId)
    await loadLibrary()
    setProgressMap(prev => ({ ...prev, [bookId]: { percentage: 100, totalPages: prev[bookId]?.totalPages } }))
  }

  if (isLoading && displayBooks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" />
      </div>
    )
  }

  if (displayBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        {searchQuery ? (
          <>
            <svg className="w-16 h-16 mb-4" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No books match "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-sm mt-2 hover:underline" style={{ color: 'var(--accent)' }}>Clear search</button>
          </>
        ) : (
          <>
            <svg className="w-20 h-20 mb-4" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Your library is empty</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add EPUB, PDF, TXT, or HTML files to get started</p>
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
            {displayBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                progress={effectiveProgressMap[book.id]?.percentage}
                totalPages={effectiveProgressMap[book.id]?.totalPages}
                onClick={() => handleOpenBook(book)}
                onDelete={() => removeBook(book.id)}
                onEditMetadata={() => setEditingBook(book)}
                onOpenQuote={() => openQuoteStudio('', `${book.metadata.title} — ${book.metadata.author}`)}
                onResetToNew={() => handleResetBook(book.id)}
                onSetFinished={() => handleSetFinished(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayBooks.map(book => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                onClick={() => handleOpenBook(book)}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)'
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-surface)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                }}
              >
                {/* Small cover */}
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-card-placeholder)' }}>
                  {book.metadata.coverUrl ? (
                    <img src={book.metadata.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{book.metadata.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{book.metadata.author}</p>
                  <p className="text-xs mt-0.5 uppercase" style={{ color: 'var(--text-faint)' }}>{book.format}</p>
                </div>

                {effectiveProgressMap[book.id]?.percentage > 0 && (
                  <div className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {effectiveProgressMap[book.id].percentage}%
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
