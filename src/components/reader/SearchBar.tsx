import React, { useState } from 'react'
import { useReaderStore } from '@/store/readerStore'
import { IconButton } from '../shared/IconButton'

interface SearchBarProps {
  onSearch: (query: string) => Promise<void> | void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const { searchResults, currentSearchIndex, navigateResult, clearSearch, setSearchOpen } = useReaderStore()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      await onSearch(query)
    }
  }

  const handleClose = () => {
    clearSearch()
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-900/95 border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <form onSubmit={handleSearch} className="flex-1">
        <input
          autoFocus
          type="text"
          placeholder="Search in book..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
        />
      </form>

      {searchResults.length > 0 && (
        <span className="text-xs text-white/40 whitespace-nowrap">
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
