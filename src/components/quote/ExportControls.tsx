import React, { useState } from 'react'
import { useQuoteStore } from '@/store/quoteStore'
import type { AspectRatio } from '@/types/quote'
import { ASPECT_RATIOS } from '@/types/quote'
import { Button } from '../shared/Button'

interface ExportControlsProps {
  onExport: () => Promise<void>
  isExporting: boolean
}

export function ExportControls({ onExport, isExporting }: ExportControlsProps) {
  const { aspectRatio, setAspectRatio } = useQuoteStore()

  return (
    <div className="space-y-3">
      {/* Aspect ratio */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Canvas Size</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(ASPECT_RATIOS) as [AspectRatio, { width: number; height: number; label: string }][]).map(([ratio, info]) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-2 rounded-lg text-xs transition-all text-left ${aspectRatio === ratio ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export button */}
      <Button
        variant="primary"
        size="lg"
        loading={isExporting}
        onClick={onExport}
        className="w-full justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Save Image
      </Button>
    </div>
  )
}
