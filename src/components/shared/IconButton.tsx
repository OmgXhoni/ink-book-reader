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
        ${active ? 'bg-ink-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}
        ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
