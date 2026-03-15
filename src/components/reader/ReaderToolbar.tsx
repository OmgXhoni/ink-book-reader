import React, { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useReaderStore } from '@/store/readerStore'
import { IconButton } from '../shared/IconButton'
import { Slider } from '../shared/Slider'
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
}

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', text: '#000' },
  { id: 'sepia', label: 'Sepia', bg: '#f4ecd8', text: '#5c4b1e' },
  { id: 'dark', label: 'Dark', bg: '#1a1a1a', text: '#fff' },
  { id: 'system', label: 'System', bg: 'linear-gradient(135deg, #fff 50%, #1a1a1a 50%)', text: '#888' },
]

export function ReaderToolbar({ book, onClose, onSearch, onTocToggle, onBookmarkToggle, onAddBookmark }: ReaderToolbarProps) {
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
    <div className="flex items-center gap-1 px-3 py-2 backdrop-blur-sm" style={{ background: 'var(--bg-toolbar)', borderBottom: '1px solid var(--border-color)', zIndex: 30, position: 'relative' }}>
      {/* Back button */}
      <Tooltip content="Back to Library">
        <IconButton label="Back to Library" onClick={onClose}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>
      </Tooltip>

      {/* Title */}
      <div className="flex-1 mx-3 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{book.metadata.title}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{book.metadata.author}</p>
      </div>

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

      {/* Search */}
      <Tooltip content="Search (Ctrl+F)">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
              <Slider
                label="Font Size"
                min={12}
                max={32}
                value={settings.fontSize}
                onChange={v => updateSettings({ fontSize: v })}
                formatValue={v => `${v}px`}
              />

              {/* Line height */}
              <Slider
                label="Line Height"
                min={1.2}
                max={2.5}
                step={0.1}
                value={settings.lineHeight}
                onChange={v => updateSettings({ lineHeight: v })}
                formatValue={v => v.toFixed(1)}
              />

              {/* Font family */}
              <div>
                <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Font</label>
                <FontSelector />
              </div>

              {/* Margins */}
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

              {/* Flow mode */}
              <div>
                <label className="text-xs uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>Layout</label>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
