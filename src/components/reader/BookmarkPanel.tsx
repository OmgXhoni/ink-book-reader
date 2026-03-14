import React from 'react'
import { useReaderStore } from '@/store/readerStore'
import type { Bookmark } from '@/types/progress'

interface BookmarkPanelProps {
  onNavigate: (position: string) => void
  onClose: () => void
}

export function BookmarkPanel({ onNavigate, onClose }: BookmarkPanelProps) {
  const { bookmarks, removeBookmark } = useReaderStore()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Bookmarks</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {bookmarks.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No bookmarks yet</p>
        ) : (
          bookmarks.map(bookmark => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onNavigate={() => onNavigate(bookmark.position)}
              onRemove={() => removeBookmark(bookmark.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function BookmarkItem({
  bookmark,
  onNavigate,
  onRemove,
}: {
  bookmark: Bookmark
  onNavigate: () => void
  onRemove: () => void
}) {
  return (
    <div className="group flex items-start gap-2 px-4 py-2 hover:bg-white/5 transition-colors">
      <button className="flex-1 text-left" onClick={onNavigate}>
        <p className="text-sm text-white/80 font-medium">{bookmark.label}</p>
        {bookmark.excerpt && (
          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{bookmark.excerpt}</p>
        )}
        <p className="text-xs text-white/25 mt-0.5">
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
