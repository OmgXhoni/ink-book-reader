import React, { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { LibraryPanel } from '../library/LibraryPanel'
import { ReaderView } from '../reader/ReaderView'
import { QuoteStudio } from '../quote/QuoteStudio'
import { useReaderStore } from '@/store/readerStore'

const SIDEBAR_MIN = 220
const SIDEBAR_MAX = 400
const SIDEBAR_DEFAULT = 280

export function AppShell() {
  const { activeBook } = useReaderStore()
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const [isDragging, setIsDragging] = useState(false)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startWidth + delta))
      setSidebarWidth(newWidth)
    }

    const onUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="flex-shrink-0 flex flex-col bg-neutral-900/60"
      >
        <Sidebar />
        <div className="flex-1 overflow-hidden flex flex-col">
          <LibraryPanel />
        </div>
      </div>

      {/* Resize handle */}
      <div
        className={`w-1 flex-shrink-0 cursor-col-resize hover:bg-ink-500/50 transition-colors ${isDragging ? 'bg-ink-500/50' : 'bg-transparent'}`}
        onMouseDown={startResize}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col bg-neutral-950">
        {activeBook ? (
          <ReaderView />
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center text-white/20">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium text-white/20">Select a book to start reading</p>
            </div>
          </div>
        )}
      </div>

      {/* Quote Studio overlay */}
      <QuoteStudio />
    </div>
  )
}
