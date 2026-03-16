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

export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green' | 'pink'

export interface HighlightRect {
  x: number
  y: number
  w: number
  h: number
}

export interface Highlight {
  id: string
  bookId: string
  cfiRange: string
  text: string
  color: HighlightColor
  createdAt: string
  rects?: HighlightRect[] // page-relative pixel rects for PDF visual rendering
}
