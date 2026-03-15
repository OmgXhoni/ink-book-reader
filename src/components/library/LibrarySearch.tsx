import React from 'react'

interface LibrarySearchProps {
  value: string
  onChange: (value: string) => void
}

export function LibrarySearch({ value, onChange }: LibrarySearchProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: 'var(--text-muted)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search books..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none transition-colors"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        >
          x
        </button>
      )}
    </div>
  )
}
