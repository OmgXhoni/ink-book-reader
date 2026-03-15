import React from 'react'
import type { TocItem } from '@/hooks/useEpub'

interface TocPanelProps {
  toc: TocItem[]
  onNavigate: (href: string) => void
  onClose: () => void
}

function TocEntry({ item, depth, onNavigate }: { item: TocItem; depth: number; onNavigate: (href: string) => void }) {
  return (
    <div>
      <button
        className="w-full text-left px-4 py-2 text-sm rounded-lg transition-colors"
        style={{ paddingLeft: `${16 + depth * 16}px`, color: 'var(--text-secondary)' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-surface)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
        onClick={() => onNavigate(item.href)}
      >
        {item.label}
      </button>
      {item.subitems?.map(sub => (
        <TocEntry key={sub.id} item={sub} depth={depth + 1} onNavigate={onNavigate} />
      ))}
    </div>
  )
}

export function TocPanel({ toc, onNavigate, onClose }: TocPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Table of Contents</h3>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {toc.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-faint)' }}>No table of contents</p>
        ) : (
          toc.map(item => (
            <TocEntry key={item.id} item={item} depth={0} onNavigate={onNavigate} />
          ))
        )}
      </div>
    </div>
  )
}
