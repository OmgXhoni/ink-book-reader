import React from 'react'
import { Button } from '../shared/Button'
import { useLibraryStore } from '@/store/libraryStore'

export function AddBookButton() {
  const { openAddBookDialog, isLoading } = useLibraryStore()

  return (
    <Button
      variant="primary"
      size="sm"
      loading={isLoading}
      onClick={openAddBookDialog}
      className="gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Books
    </Button>
  )
}
