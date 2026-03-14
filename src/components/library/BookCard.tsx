import React, { useState } from 'react'
import type { Book } from '@/types/book'
import { ProgressRing } from '../shared/ProgressRing'
import { BookContextMenu } from './BookContextMenu'

interface BookCardProps {
  book: Book
  progress?: number
  onClick: () => void
  onDelete: () => void
  onEditMetadata: () => void
  onOpenQuote: () => void
}

const FORMAT_COLORS: Record<string, string> = {
  epub: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pdf: 'bg-red-500/20 text-red-300 border-red-500/30',
  txt: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  html: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export function BookCard({ book, progress = 0, onClick, onDelete, onEditMetadata, onOpenQuote }: BookCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [coverError, setCoverError] = useState(false)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Cover */}
        <div className="aspect-[2/3] relative bg-neutral-800 overflow-hidden">
          {book.metadata.coverUrl && !coverError ? (
            <img
              src={book.metadata.coverUrl}
              alt={book.metadata.title}
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-ink-800 to-ink-950">
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
          <p className="text-white text-sm font-medium line-clamp-2 leading-tight">{book.metadata.title}</p>
          <p className="text-white/50 text-xs mt-0.5 truncate">{book.metadata.author}</p>
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
        />
      )}
    </>
  )
}
