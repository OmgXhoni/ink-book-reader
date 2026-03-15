import React, { useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { FontCard } from './FontCard'
import { FontImportButton } from './FontImportButton'
import { useFontStore } from '@/store/fontStore'
import { BUNDLED_FONT_FAMILIES } from '@/data/bundledFonts'

interface FontLibraryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FontLibraryModal({ isOpen, onClose }: FontLibraryModalProps) {
  const { fonts, loadFonts, removeFont } = useFontStore()

  useEffect(() => {
    if (isOpen) loadFonts()
  }, [isOpen, loadFonts])

  return (
    <Modal isOpen={isOpen} title="Font Library" onClose={onClose} size="md">
      <div className="p-6">
        {/* Bundled fonts */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--text-faint)' }}>
            Ink Fonts — {BUNDLED_FONT_FAMILIES.length} families
          </p>
          <div className="space-y-2">
            {BUNDLED_FONT_FAMILIES.map(family => (
              <div
                key={family.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{family.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {family.variants.length} variant{family.variants.length === 1 ? '' : 's'}
                    {family.isVariable ? ' (variable)' : ''}
                  </p>
                </div>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                  Bundled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom fonts */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>
              Custom Fonts — {fonts.length === 0 ? 'None imported' : `${fonts.length} font${fonts.length === 1 ? '' : 's'}`}
            </p>
            <FontImportButton />
          </div>

          {fonts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Import TTF or OTF font files</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fonts.map(font => (
                <FontCard key={font.id} font={font} onDelete={() => removeFont(font.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
