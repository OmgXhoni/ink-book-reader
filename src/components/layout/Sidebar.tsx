import React, { useState } from 'react'
import { useLibraryStore, type ViewMode } from '@/store/libraryStore'
import { AddBookButton } from '../library/AddBookButton'
import { FontLibraryModal } from '../fonts/FontLibraryModal'
import { IconButton } from '../shared/IconButton'
import { Tooltip } from '../shared/Tooltip'

export function Sidebar() {
  const { viewMode, setViewMode, sortBy, setSortBy } = useLibraryStore()
  const [showFonts, setShowFonts] = useState(false)

  return (
    <>
      <div className="flex flex-col flex-shrink-0 border-r border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-ink-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">Ink</span>
          </div>

          <div className="flex items-center gap-1">
            {/* View mode toggle */}
            <Tooltip content="Grid view">
              <IconButton
                label="Grid view"
                active={viewMode === 'grid'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </IconButton>
            </Tooltip>

            <Tooltip content="List view">
              <IconButton
                label="List view"
                active={viewMode === 'list'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Sort + Add */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none"
          >
            <option value="dateAdded">Recent</option>
            <option value="lastOpened">Last Read</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
          </select>
          <AddBookButton />
        </div>

        {/* Footer actions */}
        <div className="mt-auto border-t border-white/10 p-3 flex justify-end">
          <Tooltip content="Font Library" position="right">
            <IconButton label="Font Library" onClick={() => setShowFonts(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <FontLibraryModal isOpen={showFonts} onClose={() => setShowFonts(false)} />
    </>
  )
}
