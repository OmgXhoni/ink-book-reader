import React, { useState, useRef } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ content, children, position = 'bottom', delay = 500 }: TooltipProps) {
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShow(true), delay)
  }

  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShow(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && (
        <div className={`absolute z-50 pointer-events-none ${positions[position]}`}>
          <div
            className="text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg"
            style={{
              background: 'var(--bg-toolbar)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
