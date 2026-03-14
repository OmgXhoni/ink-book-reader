import React, { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useFontStore } from '@/store/fontStore'
import { useReaderStore } from '@/store/readerStore'
import { IconButton } from '../shared/IconButton'
import { Slider } from '../shared/Slider'
import { Tooltip } from '../shared/Tooltip'
import type { Book } from '@/types/book'
import type { ThemeMode } from '@/types/settings'

interface ReaderToolbarProps {
  book: Book
  onClose: () => void
  onSearch: () => void
  onTocToggle: () => void
  onBookmarkToggle: () => void
  onAddBookmark?: () => void
}

const BUILT_IN_FONTS = ['Georgia', 'Times New Roman', 'Arial', 'Verdana', 'Palatino', 'Garamond', 'Baskerville']

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', text: '#000' },
  { id: 'sepia', label: 'Sepia', bg: '#f4ecd8', text: '#5c4b1e' },
  { id: 'dark', label: 'Dark', bg: '#1a1a1a', text: '#fff' },
  { id: 'system', label: 'System', bg: 'linear-gradient(135deg, #fff 50%, #1a1a1a 50%)', text: '#888' },
]

export function ReaderToolbar({ book, onClose, onSearch, onTocToggle, onBookmarkToggle, onAddBookmark }: ReaderToolbarProps) {
  const { settings, updateSettings } = useSettingsStore()
  const { fonts } = useFontStore()
  const { isTocOpen, isBookmarkPanelOpen, isSearchOpen } = useReaderStore()
  const [showSettings, setShowSettings] = useState(false)

  const allFonts = [...BUILT_IN_FONTS, ...fonts.map(f => f.name)]

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-neutral-900/95 backdrop-blur-sm border-b border-white/10">
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
        <p className="text-white/80 text-sm font-medium truncate">{book.metadata.title}</p>
        <p className="text-white/40 text-xs truncate">{book.metadata.author}</p>
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

      {/* Bookmark */}
      <Tooltip content="Bookmarks">
        <IconButton label="Bookmarks" active={isBookmarkPanelOpen} onClick={onBookmarkToggle}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </IconButton>
      </Tooltip>

      {/* Add bookmark */}
      {onAddBookmark && (
        <Tooltip content="Add Bookmark">
          <IconButton label="Add Bookmark" onClick={onAddBookmark}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Settings */}
      <div className="relative">
        <Tooltip content="Reader Settings">
          <IconButton label="Settings" active={showSettings} onClick={() => setShowSettings(!showSettings)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </IconButton>
        </Tooltip>

        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-scale-in">
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as ThemeMode })}
                      className={`aspect-square rounded-lg border-2 transition-all ${settings.theme === t.id ? 'border-ink-500 scale-105' : 'border-white/10 hover:border-white/30'}`}
                      style={{ background: t.bg }}
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
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Font</label>
                <select
                  value={settings.fontFamily}
                  onChange={e => updateSettings({ fontFamily: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-ink-500/50"
                >
                  {allFonts.map(f => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Flow mode */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['paginated', 'scrolling'] as const).map(flow => (
                    <button
                      key={flow}
                      onClick={() => updateSettings({ readerFlow: flow })}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${settings.readerFlow === flow ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
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
