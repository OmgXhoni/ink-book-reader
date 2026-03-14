import React from 'react'

interface Template {
  id: string
  name: string
  preview: string
}

const TEMPLATES: Template[] = [
  { id: 'minimal', name: 'Minimal', preview: '#1a1a2e' },
  { id: 'dark-card', name: 'Dark Card', preview: '#0f0f0f' },
  { id: 'editorial', name: 'Editorial', preview: '#2c2c2c' },
  { id: 'instagram', name: 'Instagram', preview: '#533483' },
  { id: 'wide', name: 'Wide', preview: '#11998e' },
]

interface TemplatePickerProps {
  value: string
  onChange: (id: string) => void
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/50 uppercase tracking-wide block">Template</label>
      <div className="grid grid-cols-5 gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1.5 group`}
          >
            <div
              className={`aspect-square w-full rounded-lg border-2 transition-all ${value === t.id ? 'border-ink-500 scale-105' : 'border-white/10 hover:border-white/30'}`}
              style={{ backgroundColor: t.preview }}
            />
            <span className={`text-[10px] transition-colors ${value === t.id ? 'text-ink-400' : 'text-white/40 group-hover:text-white/60'}`}>
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
