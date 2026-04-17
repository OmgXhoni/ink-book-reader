import React from 'react'
import { useReaderStore } from '@/store/readerStore'
import { useFontStore } from '@/store/fontStore'
import { EpubReader } from './EpubReader'
import { PdfReader } from './PdfReader'
import { TxtReader } from './TxtReader'
import { HtmlReader } from './HtmlReader'
import { ErrorBoundary } from '../shared/ErrorBoundary'

export function ReaderView() {
  const { activeBook, closeBook } = useReaderStore()
  const { fontApplying } = useFontStore()

  if (!activeBook) return null

  const ReaderComponent = {
    epub: EpubReader,
    pdf: PdfReader,
    txt: TxtReader,
    html: HtmlReader,
  }[activeBook.format]

  if (!ReaderComponent) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <p className="text-red-400 mb-2">Unsupported format: {activeBook.format}</p>
          <button onClick={closeBook} className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg text-sm">Go back</button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="relative h-full">
        <ReaderComponent book={activeBook} onClose={closeBook} />
        {fontApplying && (
          <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)' }}>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading font…</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
