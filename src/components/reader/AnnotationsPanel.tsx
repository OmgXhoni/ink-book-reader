import React, { useState } from 'react'
import { useReaderStore } from '@/store/readerStore'
import type { Bookmark, Highlight, HighlightColor } from '@/types/progress'

const HIGHLIGHT_COLOR_MAP: Record<HighlightColor, { bg: string; label: string }> = {
  yellow: { bg: '#fbbf24', label: 'Yellow' },
  red: { bg: '#f87171', label: 'Red' },  // kept for legacy data
  blue: { bg: '#93c5fd', label: 'Blue' },
  green: { bg: '#86efac', label: 'Green' },
  pink: { bg: '#f9a8d4', label: 'Pink' },
}

interface AnnotationsPanelProps {
  onNavigate: (position: string) => void
  onRemoveHighlight: (highlightId: string, cfiRange: string) => void
  onClose: () => void
}

type Tab = 'bookmarks' | 'highlights'

export function AnnotationsPanel({ onNavigate, onRemoveHighlight, onClose }: AnnotationsPanelProps) {
  const { bookmarks, highlights, removeBookmark } = useReaderStore()
  const [activeTab, setActiveTab] = useState<Tab>('bookmarks')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Annotations</h3>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          style={{
            color: activeTab === 'bookmarks' ? 'var(--text-primary)' : 'var(--text-faint)',
            borderBottom: activeTab === 'bookmarks' ? '2px solid var(--text-primary)' : '2px solid transparent',
          }}
        >
          Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('highlights')}
          className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          style={{
            color: activeTab === 'highlights' ? 'var(--text-primary)' : 'var(--text-faint)',
            borderBottom: activeTab === 'highlights' ? '2px solid var(--text-primary)' : '2px solid transparent',
          }}
        >
          Highlights ({highlights.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {activeTab === 'bookmarks' ? (
          bookmarks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-faint)' }}>No bookmarks yet</p>
          ) : (
            bookmarks.map(bookmark => (
              <BookmarkItem
                key={bookmark.id}
                bookmark={bookmark}
                onNavigate={() => onNavigate(bookmark.position)}
                onRemove={() => removeBookmark(bookmark.id)}
              />
            ))
          )
        ) : (
          highlights.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-faint)' }}>No highlights yet — select text in the book to highlight</p>
          ) : (
            highlights.map(highlight => (
              <HighlightItem
                key={highlight.id}
                highlight={highlight}
                onNavigate={() => onNavigate(highlight.cfiRange)}
                onRemove={() => onRemoveHighlight(highlight.id, highlight.cfiRange)}
              />
            ))
          )
        )}
      </div>
    </div>
  )
}

function BookmarkItem({ bookmark, onNavigate, onRemove }: { bookmark: Bookmark; onNavigate: () => void; onRemove: () => void }) {
  return (
    <div
      className="group flex items-start gap-2 px-4 py-2 transition-colors"
      style={{ cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <button className="flex-1 text-left" onClick={onNavigate}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{bookmark.label}</p>
        {bookmark.excerpt && (
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{bookmark.excerpt}</p>
        )}
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {new Date(bookmark.createdAt).toLocaleDateString()}
        </p>
      </button>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 p-1 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function HighlightItem({ highlight, onNavigate, onRemove }: { highlight: Highlight; onNavigate: () => void; onRemove: () => void }) {
  const colorInfo = HIGHLIGHT_COLOR_MAP[highlight.color] || HIGHLIGHT_COLOR_MAP.yellow

  return (
    <div
      className="group flex items-start gap-2 px-4 py-2 transition-colors"
      style={{ cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
        style={{ background: colorInfo.bg, opacity: 0.7 }}
      />
      <button className="flex-1 text-left min-w-0" onClick={onNavigate}>
        <p className="text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{highlight.text}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          {new Date(highlight.createdAt).toLocaleDateString()}
        </p>
      </button>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 p-1 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
