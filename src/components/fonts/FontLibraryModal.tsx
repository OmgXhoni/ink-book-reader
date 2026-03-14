import React, { useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { FontCard } from './FontCard'
import { FontImportButton } from './FontImportButton'
import { useFontStore } from '@/store/fontStore'

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
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/50 text-sm">
            {fonts.length === 0 ? 'No custom fonts imported' : `${fonts.length} font${fonts.length === 1 ? '' : 's'}`}
          </p>
          <FontImportButton />
        </div>

        {fonts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-white/10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-white/30 text-sm">Import TTF or OTF font files</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fonts.map(font => (
              <FontCard key={font.id} font={font} onDelete={() => removeFont(font.id)} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
