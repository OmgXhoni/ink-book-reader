import React from 'react'
import type { CustomFont } from '@/types/font'

interface FontCardProps {
  font: CustomFont
  onDelete: () => void
}

export function FontCard({ font, onDelete }: FontCardProps) {
  return (
    <div className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium" style={{ fontFamily: font.name }}>{font.name}</p>
        <p className="text-white/40 text-xs mt-0.5 uppercase">{font.format}</p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
