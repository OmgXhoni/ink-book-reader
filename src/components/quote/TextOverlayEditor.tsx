import React from 'react'
import type { QuoteTextStyle } from '@/types/quote'
import { Slider } from '../shared/Slider'

const FONTS = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Palatino', 'Garamond', 'Baskerville', 'Didot']
const ALIGNS = ['left', 'center', 'right'] as const

interface TextOverlayEditorProps {
  text: string
  attribution: string
  textStyle: QuoteTextStyle
  onTextChange: (text: string) => void
  onAttributionChange: (attr: string) => void
  onStyleChange: (style: QuoteTextStyle) => void
}

export function TextOverlayEditor({
  text,
  attribution,
  textStyle,
  onTextChange,
  onAttributionChange,
  onStyleChange,
}: TextOverlayEditorProps) {
  const set = (key: keyof QuoteTextStyle) => (value: QuoteTextStyle[keyof QuoteTextStyle]) => {
    onStyleChange({ ...textStyle, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Quote text */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Quote Text</label>
        <textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          rows={4}
          placeholder="Enter your quote..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ink-500/50 resize-none transition-colors"
        />
      </div>

      {/* Attribution */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Attribution</label>
        <input
          type="text"
          value={attribution}
          onChange={e => onAttributionChange(e.target.value)}
          placeholder="Book Title — Author Name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ink-500/50 transition-colors"
        />
      </div>

      {/* Font */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Font</label>
        <select
          value={textStyle.fontFamily}
          onChange={e => set('fontFamily')(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-ink-500/50"
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font size */}
      <Slider
        label="Font Size"
        min={16}
        max={80}
        value={textStyle.fontSize}
        onChange={v => set('fontSize')(v)}
        formatValue={v => `${v}px`}
      />

      {/* Text color */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-white/50 uppercase tracking-wide">Text Color</label>
        <input
          type="color"
          value={textStyle.color}
          onChange={e => set('color')(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent"
        />
      </div>

      {/* Text align */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Alignment</label>
        <div className="flex gap-2">
          {ALIGNS.map(align => (
            <button
              key={align}
              onClick={() => set('textAlign')(align)}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-all capitalize ${textStyle.textAlign === align ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Style toggles */}
      <div className="flex gap-3">
        <button
          onClick={() => set('fontStyle')(textStyle.fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-italic transition-all italic ${textStyle.fontStyle === 'italic' ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
        >
          Italic
        </button>
        <button
          onClick={() => set('fontWeight')(textStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${textStyle.fontWeight === 'bold' ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
        >
          Bold
        </button>
        <button
          onClick={() => set('shadow')(!textStyle.shadow)}
          className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${textStyle.shadow ? 'bg-ink-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
        >
          Shadow
        </button>
      </div>
    </div>
  )
}
