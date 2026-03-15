import React, { useState } from 'react'
import { useLibraryStore, type ViewMode, type FilterMode } from '@/store/libraryStore'
import { useSettingsStore } from '@/store/settingsStore'
import { AddBookButton } from '../library/AddBookButton'
import { FontLibraryModal } from '../fonts/FontLibraryModal'
import { IconButton } from '../shared/IconButton'
import { Tooltip } from '../shared/Tooltip'

export function Sidebar() {
  const { viewMode, setViewMode, filterMode, setFilterMode } = useLibraryStore()
  const { isDark, updateSettings } = useSettingsStore()
  const [showFonts, setShowFonts] = useState(false)

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' })
  }

  return (
    <>
      <div className="flex flex-col flex-shrink-0" style={{ borderRight: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center" style={{ border: '1px solid var(--border-color)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#171717">
                <circle cx="8" cy="10" r="3.5" opacity="0.85" />
                <circle cx="15" cy="8" r="2.5" opacity="0.7" />
                <circle cx="13" cy="14" r="2" opacity="0.6" />
                <circle cx="9.5" cy="16" r="1.5" opacity="0.5" />
                <circle cx="16.5" cy="13" r="1" opacity="0.4" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Ink</span>
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

        {/* Filter + Add */}
        <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <select
            value={filterMode}
            onChange={e => setFilterMode(e.target.value as FilterMode)}
            className="flex-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <option value="all">All</option>
            <option value="recents">Recents</option>
            <option value="new">New</option>
            <option value="inProgress">In Progress</option>
            <option value="finished">Finished</option>
            <option value="length">Length</option>
            <option value="titleAZ">Title A-Z</option>
            <option value="authorAZ">Author A-Z</option>
          </select>
          <AddBookButton />
        </div>

        {/* Footer actions */}
        <div className="mt-auto p-3 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Tooltip content={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="right">
            <IconButton label="Toggle theme" onClick={toggleTheme}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </IconButton>
          </Tooltip>
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
