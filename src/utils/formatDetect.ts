import type { BookFormat } from '@/types/book'

export function detectFormatByExtension(filename: string): BookFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'epub': return 'epub'
    case 'pdf': return 'pdf'
    case 'txt': return 'txt'
    case 'html':
    case 'htm': return 'html'
    default: return null
  }
}

export function getMimeType(format: BookFormat): string {
  switch (format) {
    case 'epub': return 'application/epub+zip'
    case 'pdf': return 'application/pdf'
    case 'txt': return 'text/plain'
    case 'html': return 'text/html'
  }
}
