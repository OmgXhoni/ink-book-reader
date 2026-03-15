import React, { useState } from 'react'
import type { Book } from '@/types/book'
import { ProgressRing } from '../shared/ProgressRing'
import { BookContextMenu } from './BookContextMenu'

interface BookCardProps {
  book: Book
  progress?: number
  totalPages?: number
  onClick: () => void
  onDelete: () => void
  onEditMetadata: () => void
  onOpenQuote: () => void
  onResetToNew: () => void
  onSetFinished: () => void
}

const FORMAT_COLORS: Record<string, string> = {
  epub: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pdf: 'bg-red-500/20 text-red-300 border-red-500/30',
  txt: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  html: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export function BookCard({ book, progress = 0, totalPages, onClick, onDelete, onEditMetadata, onOpenQuote, onResetToNew, onSetFinished }: BookCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [coverError, setCoverError] = useState(false)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', opacity: progress >= 100 ? 0.5 : 1 }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-surface-hover)'
          e.currentTarget.style.borderColor = 'var(--border-hover)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-surface)'
          e.currentTarget.style.borderColor = 'var(--border-color)'
        }}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Cover */}
        <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'var(--bg-card-placeholder)' }}>
          {book.metadata.coverUrl && !coverError ? (
            <img
              src={book.metadata.coverUrl}
              alt={book.metadata.title}
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-neutral-600 to-neutral-800">
              <svg className="w-10 h-10 text-white/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-white/40 text-xs text-center font-medium line-clamp-3">{book.metadata.title}</p>
            </div>
          )}

          {/* Format badge */}
          <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${FORMAT_COLORS[book.format] || 'bg-gray-500/20 text-gray-300'}`}>
            {book.format}
          </div>

          {/* Progress ring */}
          {progress > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 rounded-full p-0.5">
              <ProgressRing percentage={progress} size={28} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium line-clamp-2 leading-tight" style={{ color: 'var(--text-primary)' }}>{book.metadata.title}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{book.metadata.author}</p>
          {/* Status: New / Finished / Progress bar */}
          <div className="mt-2">
            {!book.lastOpened ? (
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>New</p>
            ) : progress >= 100 ? (
              <p className="text-[11px] font-bold" style={{ color: '#ef4444' }}>FINISHED</p>
            ) : progress > 0 ? (
              <>
                <div className="flex items-center justify-between text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  <span>{progress}%</span>
                  <span>{totalPages ? `${Math.round(totalPages * (100 - progress) / 100)} pages left` : `${100 - progress}% left`}</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card-placeholder)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: 'var(--text-muted)' }}
                  />
                </div>
              </>
            ) : (
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>New</p>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <BookContextMenu
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onOpen={onClick}
          onDelete={onDelete}
          onEditMetadata={onEditMetadata}
          onOpenQuote={onOpenQuote}
          onResetToNew={onResetToNew}
          onSetFinished={onSetFinished}
        />
      )}
    </>
  )
}
