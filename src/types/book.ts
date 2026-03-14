export type BookFormat = 'epub' | 'pdf' | 'txt' | 'html'

export interface BookMetadata {
  title: string
  author: string
  description?: string
  publisher?: string
  language?: string
  publishedDate?: string
  coverUrl?: string
  pageCount?: number
  tags?: string[]
}

export interface Book {
  id: string
  filePath: string
  format: BookFormat
  metadata: BookMetadata
  dateAdded: string
  lastOpened?: string
}
