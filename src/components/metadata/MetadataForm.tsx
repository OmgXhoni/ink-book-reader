import React from 'react'
import type { BookMetadata } from '@/types/book'

interface MetadataFormProps {
  metadata: BookMetadata
  onChange: (metadata: BookMetadata) => void
}

function Field({ label, value, onChange, multiline = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ink-500/50 transition-colors"

  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  )
}

export function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  const set = (key: keyof BookMetadata) => (value: string) => {
    onChange({ ...metadata, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Field label="Title" value={metadata.title} onChange={set('title')} />
      <Field label="Author" value={metadata.author} onChange={set('author')} />
      <Field label="Publisher" value={metadata.publisher || ''} onChange={set('publisher')} />
      <Field label="Published Date" value={metadata.publishedDate || ''} onChange={set('publishedDate')} />
      <Field label="Language" value={metadata.language || ''} onChange={set('language')} />
      <Field label="Description" value={metadata.description || ''} onChange={set('description')} multiline />
    </div>
  )
}
