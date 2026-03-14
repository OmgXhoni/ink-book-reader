import * as fs from 'fs'
import * as path from 'path'
import type { BookMetadata, BookFormat } from '../../src/types/book'

export async function extractMetadata(filePath: string, format: BookFormat): Promise<BookMetadata> {
  switch (format) {
    case 'epub':
      return extractEpubMetadata(filePath)
    case 'pdf':
      return extractPdfMetadata(filePath)
    case 'txt':
    case 'html':
      return extractTextMetadata(filePath)
    default:
      return { title: path.basename(filePath), author: 'Unknown' }
  }
}

async function extractEpubMetadata(filePath: string): Promise<BookMetadata> {
  try {
    // Dynamic import epubjs to avoid issues in main process
    const ePub = await import('epubjs')
    const book = ePub.default(filePath)
    await book.ready

    const metadata = book.packaging.metadata as Record<string, string>
    let coverUrl: string | undefined

    try {
      const coverPath = await book.coverUrl()
      if (coverPath) {
        coverUrl = coverPath
      }
    } catch {
      // No cover available
    }

    book.destroy()

    return {
      title: metadata.title || path.basename(filePath, '.epub'),
      author: metadata.creator || 'Unknown',
      description: metadata.description,
      publisher: metadata.publisher,
      language: metadata.language,
      publishedDate: metadata.pubdate,
      coverUrl,
    }
  } catch (err) {
    console.error('EPUB metadata extraction failed:', err)
    return {
      title: path.basename(filePath, '.epub'),
      author: 'Unknown',
    }
  }
}

async function extractPdfMetadata(filePath: string): Promise<BookMetadata> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    const data = new Uint8Array(fs.readFileSync(filePath))
    const doc = await pdfjsLib.getDocument({ data }).promise
    const info = await doc.getMetadata()
    const meta = (info.info as Record<string, string>) || {}

    let pageCount: number | undefined
    try {
      pageCount = doc.numPages
    } catch {
      // ignore
    }

    doc.destroy()

    return {
      title: meta.Title || path.basename(filePath, '.pdf'),
      author: meta.Author || 'Unknown',
      description: meta.Subject,
      publisher: meta.Creator,
      pageCount,
    }
  } catch (err) {
    console.error('PDF metadata extraction failed:', err)
    return {
      title: path.basename(filePath, '.pdf'),
      author: 'Unknown',
    }
  }
}

function extractTextMetadata(filePath: string): BookMetadata {
  const ext = path.extname(filePath)
  return {
    title: path.basename(filePath, ext),
    author: 'Unknown',
  }
}
