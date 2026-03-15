import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const sizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
}

export function IconButton({ label, active, size = 'md', children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-lg transition-all
        ${sizes[size]} ${className}
      `}
      style={active
        ? { background: 'var(--accent-bg)', color: 'var(--accent-active)' }
        : { color: 'var(--text-muted)' }
      }
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.background = 'var(--bg-surface-hover)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}
