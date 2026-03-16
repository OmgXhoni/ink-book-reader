import React, { useState } from 'react'
import { useReaderStore } from '@/store/readerStore'
import { IconButton } from '../shared/IconButton'

interface SearchBarProps {
  onSearch: (query: string) => Promise<void> | void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { searchResults, currentSearchIndex, navigateResult, clearSearch, setSearchOpen } = useReaderStore()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    try {
      await onSearch(query)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClose = () => {
    clearSearch()
    setSearchOpen(false)
    setQuery('')
    setHasSearched(false)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-xl" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)' }}>
      <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <form onSubmit={handleSearch} className="flex-1">
        <input
          autoFocus
          data-search-input
          type="text"
          placeholder="Search in book... (press Enter)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </form>

      {isSearching && (
        <span className="text-xs whitespace-nowrap animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Searching...
        </span>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && (
        <span className="text-xs whitespace-nowrap" style={{ color: '#ef4444' }}>
          No results
        </span>
      )}

      {searchResults.length > 0 && (
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          {currentSearchIndex + 1} / {searchResults.length}
        </span>
      )}

      {searchResults.length > 0 && (
        <>
          <IconButton
            label="Previous result"
            size="sm"
            onClick={() => navigateResult(Math.max(0, currentSearchIndex - 1))}
            disabled={currentSearchIndex <= 0}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </IconButton>
          <IconButton
            label="Next result"
            size="sm"
            onClick={() => navigateResult(Math.min(searchResults.length - 1, currentSearchIndex + 1))}
            disabled={currentSearchIndex >= searchResults.length - 1}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </IconButton>
        </>
      )}

      <IconButton label="Close search" size="sm" onClick={handleClose}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  )
}
