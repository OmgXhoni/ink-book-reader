import React, { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useFontStore } from '@/store/fontStore'
import { BUNDLED_FONT_FAMILIES, type BundledFontFamily } from '@/data/bundledFonts'

const SYSTEM_FONTS = ['Georgia', 'Times New Roman', 'Arial', 'Verdana', 'Palatino', 'Garamond', 'Baskerville']

export function FontSelector() {
  const { settings, updateSettings } = useSettingsStore()
  const { fonts } = useFontStore()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setExpandedFamily(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const displayName = settings.bundledFamilyId
    ? `${settings.fontFamily}${settings.fontVariant && settings.fontVariant !== 'Regular' ? ` — ${settings.fontVariant}` : ''}`
    : settings.fontFamily

  const selectSystemFont = (name: string) => {
    updateSettings({ fontFamily: name, fontVariant: undefined, fontWeight: undefined, bundledFamilyId: undefined })
    setIsOpen(false)
  }

  const selectCustomFont = (name: string) => {
    updateSettings({ fontFamily: name, fontVariant: undefined, fontWeight: undefined, bundledFamilyId: undefined })
    setIsOpen(false)
  }

  const selectBundledVariant = (family: BundledFontFamily, variantLabel: string) => {
    const variant = family.variants.find(v => v.label === variantLabel) || family.variants[0]
    updateSettings({
      fontFamily: family.name,
      fontVariant: variant.label,
      fontWeight: variant.weight,
      bundledFamilyId: family.id,
    })
    setIsOpen(false)
    setExpandedFamily(null)
  }

  const toggleFamily = (familyId: string) => {
    setExpandedFamily(prev => prev === familyId ? null : familyId)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg px-3 py-1.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
      >
        <span className="truncate">{displayName}</span>
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-color)', maxHeight: '320px', overflowY: 'auto' }}
        >
          {/* System fonts */}
          <div className="px-3 py-1.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>System</p>
          </div>
          {SYSTEM_FONTS.map(name => (
            <button
              key={name}
              onClick={() => selectSystemFont(name)}
              className="w-full px-3 py-1.5 text-sm text-left transition-colors"
              style={{
                color: settings.fontFamily === name && !settings.bundledFamilyId ? 'var(--accent-active)' : 'var(--text-secondary)',
                fontFamily: name,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {name}
            </button>
          ))}

          {/* Ink fonts (bundled) */}
          <div className="px-3 py-1.5 mt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>Ink Fonts</p>
          </div>
          {BUNDLED_FONT_FAMILIES.map(family => {
            const isActive = settings.bundledFamilyId === family.id
            const isExpanded = expandedFamily === family.id
            const hasManyVariants = family.variants.length > 1

            return (
              <div key={family.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      if (hasManyVariants) {
                        toggleFamily(family.id)
                      } else {
                        selectBundledVariant(family, family.variants[0].label)
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-left transition-colors flex items-center justify-between"
                    style={{
                      color: isActive ? 'var(--accent-active)' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span>{family.name}</span>
                    {hasManyVariants && (
                      <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Variant sub-list */}
                {isExpanded && hasManyVariants && (
                  <div style={{ background: 'var(--bg-surface)' }}>
                    {family.variants.map(variant => (
                      <button
                        key={variant.label}
                        onClick={() => selectBundledVariant(family, variant.label)}
                        className="w-full pl-7 pr-3 py-1 text-xs text-left transition-colors"
                        style={{
                          color: isActive && settings.fontVariant === variant.label ? 'var(--accent-active)' : 'var(--text-muted)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Custom fonts */}
          {fonts.length > 0 && (
            <>
              <div className="px-3 py-1.5 mt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>Custom</p>
              </div>
              {fonts.map(font => (
                <button
                  key={font.id}
                  onClick={() => selectCustomFont(font.name)}
                  className="w-full px-3 py-1.5 text-sm text-left transition-colors"
                  style={{
                    color: settings.fontFamily === font.name && !settings.bundledFamilyId ? 'var(--accent-active)' : 'var(--text-secondary)',
                    fontFamily: font.name,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {font.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
