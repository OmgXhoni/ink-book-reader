import React, { useRef } from 'react'
import type { QuoteBackground } from '@/types/quote'

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#2d1b69', '#11998e', '#2c3e50', '#c94b4b',
  '#4b134f', '#24243e', '#373b44', '#000000',
]

interface BackgroundPickerProps {
  value: QuoteBackground
  onChange: (bg: QuoteBackground) => void
}

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange({ type: 'image', url, blur: 0, opacity: 0.4 })
  }

  return (
    <div className="space-y-3">
      {/* Preset colors */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Background Color</label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              className={`aspect-square rounded-lg border-2 transition-all ${value.type === 'color' && value.value === color ? 'border-ink-500 scale-110' : 'border-transparent hover:border-white/30'}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ type: 'color', value: color })}
            />
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-white/50">Custom</label>
        <input
          type="color"
          value={value.type === 'color' ? value.value : '#1a1a2e'}
          onChange={e => onChange({ type: 'color', value: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Background Image</label>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm text-white/70 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Image controls */}
      {value.type === 'image' && (
        <div className="space-y-3 p-3 bg-white/5 rounded-xl">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Blur</span>
              <span>{value.blur || 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={value.blur || 0}
              onChange={e => onChange({ ...value, blur: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none bg-white/20 accent-ink-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Dark Overlay</span>
              <span>{Math.round((value.opacity || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={value.opacity || 0}
              onChange={e => onChange({ ...value, opacity: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none bg-white/20 accent-ink-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
