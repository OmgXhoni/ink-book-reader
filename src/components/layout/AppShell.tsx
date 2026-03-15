import React, { useState, useCallback, useEffect, useRef } from 'react'
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
  const [collapsed, setCollapsed] = useState(false)
  const prevActiveBookRef = useRef(activeBook)

  // Auto-expand library when a book is closed (activeBook goes from truthy to null)
  useEffect(() => {
    if (prevActiveBookRef.current && !activeBook) {
      setCollapsed(false)
    }
    prevActiveBookRef.current = activeBook
  }, [activeBook])

  const startResize = useCallback((e: React.MouseEvent) => {
    if (collapsed) return
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
  }, [sidebarWidth, collapsed])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? 0 : sidebarWidth,
          background: 'var(--bg-sidebar)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
        className="flex-shrink-0 flex flex-col"
      >
        <Sidebar />
        <div className="flex-1 overflow-hidden flex flex-col">
          <LibraryPanel />
        </div>
      </div>

      {/* Resize handle + collapse toggle */}
      <div className="flex-shrink-0 flex flex-col relative" style={{ width: collapsed ? 0 : 4 }}>
        {/* Resize handle */}
        {!collapsed && (
          <div
            className="w-1 flex-1 cursor-col-resize transition-colors"
            style={{ background: isDragging ? 'var(--accent)' : 'transparent' }}
            onMouseDown={startResize}
          />
        )}

        {/* Collapse/expand toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center rounded-full shadow-md transition-all hover:scale-110"
          style={{
            width: 20,
            height: 20,
            left: collapsed ? 4 : -8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
          title={collapsed ? 'Show library' : 'Hide library'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="4,2 7,5 4,8" />
            ) : (
              <polyline points="6,2 3,5 6,8" />
            )}
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ background: 'var(--bg-app)' }}>
        {activeBook ? (
          <ReaderView />
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center" style={{ color: 'var(--text-faint)' }}>
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium" style={{ color: 'var(--text-faint)' }}>Select a book to start reading</p>
            </div>
          </div>
        )}
      </div>

      {/* Quote Studio overlay */}
      <QuoteStudio />
    </div>
  )
}
