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
        className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded-lg"
        style={{ paddingLeft: `${16 + depth * 16}px` }}
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Table of Contents</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {toc.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No table of contents</p>
        ) : (
          toc.map(item => (
            <TocEntry key={item.id} item={item} depth={0} onNavigate={onNavigate} />
          ))
        )}
      </div>
    </div>
  )
}
