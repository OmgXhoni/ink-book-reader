import React from 'react'
import { useReaderStore } from '@/store/readerStore'
import { EpubReader } from './EpubReader'
import { PdfReader } from './PdfReader'
import { TxtReader } from './TxtReader'
import { HtmlReader } from './HtmlReader'
import { ErrorBoundary } from '../shared/ErrorBoundary'

export function ReaderView() {
  const { activeBook, closeBook } = useReaderStore()

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
      <ReaderComponent book={activeBook} onClose={closeBook} />
    </ErrorBoundary>
  )
}
