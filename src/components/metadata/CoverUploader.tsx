import React, { useState } from 'react'

interface CoverUploaderProps {
  currentCover?: string
  bookId: string
  onCoverUpdated: (url: string) => void
}

export function CoverUploader({ currentCover, bookId, onCoverUpdated }: CoverUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [coverError, setCoverError] = useState(false)

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      const url = await window.electronAPI.uploadCover(bookId)
      if (url) {
        onCoverUpdated(url)
        setCoverError(false)
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-start gap-4">
      {/* Cover preview */}
      <div className="w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-white/10">
        {currentCover && !coverError ? (
          <img
            src={currentCover}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-white/70 mb-2">Cover Image</p>
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Cover'}
        </button>
        <p className="text-xs text-white/30 mt-1">JPG, PNG, or WebP</p>
      </div>
    </div>
  )
}
