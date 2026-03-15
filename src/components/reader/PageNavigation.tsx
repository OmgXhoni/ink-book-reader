import React from 'react'
import { IconButton } from '../shared/IconButton'

interface PageNavigationProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onGoTo?: (page: number) => void
}

export function PageNavigation({ currentPage, totalPages, onPrev, onNext, onGoTo }: PageNavigationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)' }}>
      <IconButton label="Previous page" onClick={onPrev} disabled={currentPage <= 1} size="sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </IconButton>

      <span className="text-sm min-w-[80px] text-center" style={{ color: 'var(--text-muted)' }}>
        {currentPage} / {totalPages}
      </span>

      <IconButton label="Next page" onClick={onNext} disabled={currentPage >= totalPages} size="sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </IconButton>
    </div>
  )
}
