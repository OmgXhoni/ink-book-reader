import React, { useEffect, useRef, useState } from 'react'

interface BookContextMenuProps {
  position: { x: number; y: number }
  onClose: () => void
  onOpen: () => void
  onDelete: () => void
  onEditMetadata: () => void
  onOpenQuote: () => void
  onResetToNew: () => void
  onSetFinished: () => void
}

const IconOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const IconQuote = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
)

const IconReset = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const IconFinished = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconDelete = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

export function BookContextMenu({ position, onClose, onOpen, onDelete, onEditMetadata, onOpenQuote, onResetToNew, onSetFinished }: BookContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const showResetConfirmRef = useRef(false)
  showResetConfirmRef.current = showResetConfirm

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Don't close while the confirm dialog is showing
      if (showResetConfirmRef.current) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items = [
    { label: 'Open', icon: <IconOpen />, onClick: () => { onOpen(); onClose() } },
    { label: 'Edit Metadata', icon: <IconEdit />, onClick: () => { onEditMetadata(); onClose() } },
    { label: 'Create Quote Image', icon: <IconQuote />, onClick: () => { onOpenQuote(); onClose() } },
    { type: 'separator' as const },
    { label: 'Reset to New', icon: <IconReset />, onClick: () => { setShowResetConfirm(true) } },
    { label: 'Mark as Finished', icon: <IconFinished />, onClick: () => { onSetFinished(); onClose() } },
    { label: 'Remove from Library', icon: <IconDelete />, onClick: () => { onDelete(); onClose() }, danger: true },
  ]

  return (
    <>
      {/* Hide the context menu when confirm dialog is shown */}
      {!showResetConfirm && (
        <div
          ref={menuRef}
          className="fixed z-[100] rounded-xl shadow-2xl py-1 min-w-[200px] animate-scale-in"
          style={{ left: position.x, top: position.y, background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)' }}
        >
          {items.map((item, i) =>
            item.type === 'separator' ? (
              <div key={i} className="my-1" style={{ borderTop: '1px solid var(--border-color)' }} />
            ) : (
              <button
                key={i}
                onClick={item.onClick}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors"
                style={{ color: item.danger ? '#f87171' : 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = item.danger ? 'rgba(248,113,113,0.1)' : 'var(--bg-surface)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ color: item.danger ? '#f87171' : 'var(--text-muted)', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}

      {showResetConfirm && (
        <>
          <div className="fixed inset-0 z-[200]" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setShowResetConfirm(false); onClose() }} />
          <div
            className="fixed z-[201] w-96 rounded-xl shadow-2xl p-6 animate-fade-in"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-toolbar)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Reset to New?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              This will permanently remove all reading progress, bookmarks, and highlights for this book. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowResetConfirm(false); onClose() }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onResetToNew(); setShowResetConfirm(false); onClose() }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
