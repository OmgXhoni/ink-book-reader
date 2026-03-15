import React from 'react'
import type { HighlightColor } from '@/types/progress'

const COLORS: { id: HighlightColor; bg: string }[] = [
  { id: 'yellow', bg: '#fbbf24' },
  { id: 'blue', bg: '#93c5fd' },
  { id: 'green', bg: '#86efac' },
  { id: 'pink', bg: '#f9a8d4' },
]

interface HighlightPopupProps {
  position: { x: number; y: number }
  onSelect: (color: HighlightColor) => void
  onClose: () => void
  onRemove?: () => void
}

export function HighlightPopup({ position, onSelect, onClose, onRemove }: HighlightPopupProps) {
  return (
    <>
      {/* Invisible backdrop to catch clicks */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-xl"
        style={{
          left: position.x,
          top: position.y,
          background: 'var(--bg-toolbar)',
          border: '1px solid var(--border-color)',
          transform: 'translate(-50%, -120%)',
        }}
      >
        {COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-6 h-6 rounded-full transition-transform hover:scale-125"
            style={{ background: c.bg, opacity: 0.75, border: '2px solid rgba(255,255,255,0.3)' }}
            title={c.id}
          />
        ))}
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full transition-transform hover:scale-125 flex items-center justify-center"
            style={{ background: 'var(--bg-surface)', border: '2px solid rgba(255,255,255,0.3)' }}
            title="Remove highlight"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}
