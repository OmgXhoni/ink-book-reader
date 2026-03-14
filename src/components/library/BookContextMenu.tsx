import React, { useEffect, useRef } from 'react'

interface BookContextMenuProps {
  position: { x: number; y: number }
  onClose: () => void
  onOpen: () => void
  onDelete: () => void
  onEditMetadata: () => void
  onOpenQuote: () => void
}

export function BookContextMenu({ position, onClose, onOpen, onDelete, onEditMetadata, onOpenQuote }: BookContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items = [
    { label: 'Open', icon: '📖', onClick: () => { onOpen(); onClose() } },
    { label: 'Edit Metadata', icon: '✏️', onClick: () => { onEditMetadata(); onClose() } },
    { label: 'Create Quote Image', icon: '✨', onClick: () => { onOpenQuote(); onClose() } },
    { type: 'separator' as const },
    { label: 'Remove from Library', icon: '🗑️', onClick: () => { onDelete(); onClose() }, danger: true },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-neutral-800 border border-white/10 rounded-xl shadow-2xl py-1 min-w-[200px] animate-scale-in"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, i) =>
        item.type === 'separator' ? (
          <div key={i} className="my-1 border-t border-white/10" />
        ) : (
          <button
            key={i}
            onClick={item.onClick}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
              ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  )
}
