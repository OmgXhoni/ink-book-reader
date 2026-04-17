import React, { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useReaderStore } from '@/store/readerStore'
import { IconButton } from '../shared/IconButton'
import { Tooltip } from '../shared/Tooltip'
import { FontSelector } from './FontSelector'
import type { Book } from '@/types/book'
import type { ThemeMode, MarginSize } from '@/types/settings'

interface ReaderToolbarProps {
  book: Book
  onClose: () => void
  onSearch: () => void
  onTocToggle: () => void
  onBookmarkToggle: () => void
  onAddBookmark?: () => void
  isPdf?: boolean
  currentPage?: number
  totalPages?: number
  onPrevPage?: () => void
  onNextPage?: () => void
  zoomLevel?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
}

function OptionRow<T extends number>({ label, options, value, onChange, format }: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
  format?: (v: T) => string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="flex-1 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: value === opt ? 'var(--accent-active)' : 'var(--bg-input)',
              color: value === opt ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${value === opt ? 'var(--accent-active)' : 'var(--border-color)'}`,
            }}
          >
            {format ? format(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', text: '#000' },
  { id: 'sepia', label: 'Sepia', bg: '#f4ecd8', text: '#5c4b1e' },
  { id: 'dark', label: 'Dark', bg: '#1a1a1a', text: '#fff' },
  { id: 'system', label: 'System', bg: 'linear-gradient(135deg, #fff 50%, #1a1a1a 50%)', text: '#888' },
]

export function ReaderToolbar({ book, onClose, onSearch, onTocToggle, onBookmarkToggle, onAddBookmark, isPdf, currentPage, totalPages, onPrevPage, onNextPage, zoomLevel, onZoomIn, onZoomOut }: ReaderToolbarProps) {
  const { settings, updateSettings } = useSettingsStore()
  const { isTocOpen, isAnnotationPanelOpen, isSearchOpen } = useReaderStore()
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!showSettings) return
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  return (
    <div className="relative flex items-center px-3 py-2 backdrop-blur-sm" style={{ background: 'var(--bg-toolbar)', borderBottom: '1px solid var(--border-color)', zIndex: 30 }}>
      {/* Left: back + title */}
      <div className="flex items-center gap-1 min-w-0" style={{ flex: '1 1 0' }}>
        <Tooltip content="Back to Library">
          <IconButton label="Back to Library" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
        </Tooltip>
        <div className="mx-2 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{book.metadata.title}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{book.metadata.author}</p>
        </div>
      </div>

      {/* Center: page navigation */}
      {totalPages && totalPages > 1 && onPrevPage && onNextPage && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <IconButton label="Previous page" onClick={onPrevPage} disabled={currentPage !== undefined && currentPage <= 1} size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
          <span className="text-sm min-w-[72px] text-center select-none" style={{ color: 'var(--text-muted)' }}>
            {currentPage} / {totalPages}
          </span>
          <IconButton label="Next page" onClick={onNextPage} disabled={currentPage !== undefined && totalPages !== undefined && currentPage >= totalPages} size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </IconButton>
        </div>
      )}

      {/* Right: action buttons */}
      <div className="flex items-center gap-1" style={{ flex: '1 1 0', justifyContent: 'flex-end' }}>

      {/* TOC (EPUB only) */}
      {book.format === 'epub' && (
        <Tooltip content="Table of Contents">
          <IconButton label="Table of Contents" active={isTocOpen} onClick={onTocToggle}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Zoom (PDF only) */}
      {isPdf && onZoomOut && onZoomIn && (
        <div className="flex items-center gap-0.5">
          <Tooltip content="Zoom Out">
            <IconButton label="Zoom Out" onClick={onZoomOut}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v5M5 10a7 7 0 1114 0 7 7 0 01-14 0zM9 10h6" />
              </svg>
            </IconButton>
          </Tooltip>
          <span className="text-xs select-none min-w-[36px] text-center" style={{ color: 'var(--text-muted)' }}>
            {Math.round((zoomLevel ?? 1) * 100)}%
          </span>
          <Tooltip content="Zoom In">
            <IconButton label="Zoom In" onClick={onZoomIn}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v5M5 10a7 7 0 1114 0 7 7 0 01-14 0zM9 10h6M12 7v6" />
              </svg>
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* Search */}
      <Tooltip content={`Search (${navigator.platform.startsWith('Mac') ? '⌘' : 'Ctrl+'}F)`}>
        <IconButton label="Search" active={isSearchOpen} onClick={onSearch}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </IconButton>
      </Tooltip>

      {/* Annotations panel */}
      <Tooltip content="Annotations">
        <IconButton label="Annotations" active={isAnnotationPanelOpen} onClick={onBookmarkToggle}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </IconButton>
      </Tooltip>

      {/* Add bookmark */}
      {onAddBookmark && (
        <Tooltip content="Add Bookmark">
          <IconButton label="Add Bookmark" onClick={onAddBookmark}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m2-2h-4" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Settings */}
      <div className="relative" ref={settingsRef}>
        <Tooltip content="Reader Settings">
          <IconButton label="Settings" active={showSettings} onClick={() => setShowSettings(!showSettings)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </IconButton>
        </Tooltip>

        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl p-4 z-50 animate-scale-in" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)' }}>
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as ThemeMode })}
                      className={`aspect-square rounded-lg border-2 transition-all ${settings.theme === t.id ? 'scale-105' : ''}`}
                      style={{ background: t.bg, borderColor: settings.theme === t.id ? 'var(--accent-active)' : 'var(--border-color)' }}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Font size */}
              <OptionRow
                label="Font Size"
                options={[24, 28, 32]}
                value={settings.fontSize}
                onChange={v => updateSettings({ fontSize: v })}
                format={v => v === 24 ? 'Small' : v === 28 ? 'Medium' : 'Large'}
              />

              {/* Font family */}
              <div>
                <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Font</label>
                <FontSelector />
              </div>

              {/* Line height — txt and html only */}
              {(book.format === 'txt' || book.format === 'html') && (
                <OptionRow
                  label="Line Height"
                  options={[1.2, 1.4, 1.6, 1.8, 2.0]}
                  value={settings.lineHeight}
                  onChange={v => updateSettings({ lineHeight: v })}
                  format={v => v.toFixed(1)}
                />
              )}

              {/* Margins — txt and html only */}
              {(book.format === 'txt' || book.format === 'html') && (
                <div>
                  <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Margins</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ marginSize: size })}
                        className="py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                        style={settings.marginSize === size ? { background: 'var(--accent-active)', color: '#fff' } : { background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flow mode */}
              <div>
                <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Layout</label>
                {isPdf ? (
                  <p className="text-xs py-1.5 px-2 rounded-lg text-center" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    Scroll Only for PDF's
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(['paginated', 'scrolling'] as const).map(flow => (
                      <button
                        key={flow}
                        onClick={() => updateSettings({ readerFlow: flow })}
                        className="py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                        style={settings.readerFlow === flow ? { background: 'var(--accent-active)', color: '#fff' } : { background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                      >
                        {flow}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
