export interface ReadingProgress {
  bookId: string
  position: string // CFI for EPUB, page number string for PDF, fraction string for TXT/HTML
  percentage: number
  lastRead: string
  totalPages?: number
}

export interface Bookmark {
  id: string
  bookId: string
  position: string // CFI or page number
  label: string
  excerpt?: string
  createdAt: string
}
