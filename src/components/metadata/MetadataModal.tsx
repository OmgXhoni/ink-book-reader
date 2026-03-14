import React, { useState } from 'react'
import { Modal } from '../shared/Modal'
import { MetadataForm } from './MetadataForm'
import { CoverUploader } from './CoverUploader'
import { Button } from '../shared/Button'
import { useLibraryStore } from '@/store/libraryStore'
import type { Book, BookMetadata } from '@/types/book'

interface MetadataModalProps {
  book: Book
  onClose: () => void
}

export function MetadataModal({ book, onClose }: MetadataModalProps) {
  const [metadata, setMetadata] = useState<BookMetadata>({ ...book.metadata })
  const [isSaving, setIsSaving] = useState(false)
  const { updateMetadata } = useLibraryStore()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateMetadata(book.id, metadata)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleCoverUpdated = (url: string) => {
    setMetadata(m => ({ ...m, coverUrl: url }))
  }

  return (
    <Modal isOpen title="Edit Book Details" onClose={onClose} size="md">
      <div className="p-6 space-y-6">
        <CoverUploader
          currentCover={metadata.coverUrl}
          bookId={book.id}
          onCoverUpdated={handleCoverUpdated}
        />
        <MetadataForm metadata={metadata} onChange={setMetadata} />
      </div>

      <div className="px-6 pb-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={isSaving} onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  )
}
