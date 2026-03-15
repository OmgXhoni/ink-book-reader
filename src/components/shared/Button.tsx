import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--text-primary)', color: 'var(--bg-app)', border: '1px solid var(--border-color)' },
    secondary: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    danger: { background: '#dc2626cc', color: '#fff', border: '1px solid #ef444450' },
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} ${className}
      `}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
