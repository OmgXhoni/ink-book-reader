import React from 'react'
import { Button } from '../shared/Button'
import { useFontStore } from '@/store/fontStore'

export function FontImportButton() {
  const { importFonts, isLoading } = useFontStore()

  return (
    <Button variant="secondary" size="sm" loading={isLoading} onClick={importFonts}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Import Fonts
    </Button>
  )
}
