import React from 'react'

interface SliderProps {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function Slider({ label, min, max, step = 1, value, onChange, formatValue }: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span className="font-mono">{formatValue ? formatValue(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: 'var(--range-track)' }}
      />
    </div>
  )
}
