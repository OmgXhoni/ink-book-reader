// Type declaration for window.electronAPI
// The full type is defined in electron/preload.ts and exposed via contextBridge

declare global {
  interface Window {
    electronAPI: {
      openBookDialog: () => Promise<string[]>
      addBook: (filePath: string) => Promise<unknown>
      getAllBooks: () => Promise<unknown[]>
      deleteBook: (bookId: string) => Promise<boolean>
      getFileBuffer: (bookId: string) => Promise<Buffer>
      updateLastOpened: (bookId: string) => Promise<void>
      updateMetadata: (bookId: string, metadata: Record<string, unknown>) => Promise<unknown>
      uploadCover: (bookId: string) => Promise<string | null>
      getCoverData: (bookId: string) => Promise<string | null>
      getProgress: (bookId: string) => Promise<unknown>
      saveProgress: (bookId: string, progress: unknown) => Promise<boolean>
      getBookmarks: (bookId: string) => Promise<unknown[]>
      addBookmark: (bookId: string, bookmark: unknown) => Promise<unknown>
      removeBookmark: (bookId: string, bookmarkId: string) => Promise<boolean>
      getAllFonts: () => Promise<unknown[]>
      importFonts: () => Promise<unknown[]>
      deleteFont: (fontId: string) => Promise<boolean>
      getFontDataUrl: (fontId: string) => Promise<string | null>
      getSettings: () => Promise<unknown>
      updateSettings: (settings: Record<string, unknown>) => Promise<unknown>
      saveImage: (dataUrl: string, defaultName: string) => Promise<string | null>
      onFileOpened: (callback: (filePath: string) => void) => () => void
    }
  }
}

export {}
