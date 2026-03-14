import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import type { BookMetadata, BookFormat } from '../../src/types/book'
import { getCoversDir } from '../utils/paths'

export async function extractMetadata(
  filePath: string,
  format: BookFormat,
  bookId: string
): Promise<BookMetadata> {
  switch (format) {
    case 'epub':
      return extractEpubMetadata(filePath, bookId)
    case 'pdf':
      return extractPdfMetadata(filePath)
    case 'txt':
    case 'html':
      return extractTextMetadata(filePath)
    default:
      return { title: path.basename(filePath), author: 'Unknown' }
  }
}

function extractEpubMetadata(filePath: string, bookId: string): BookMetadata {
  try {
    const zip = new AdmZip(filePath)

    // 1. Find the OPF file path from META-INF/container.xml
    const containerEntry = zip.getEntry('META-INF/container.xml')
    if (!containerEntry) throw new Error('No container.xml')
    const containerXml = containerEntry.getData().toString('utf-8')
    const opfPathMatch = /full-path="([^"]+)"/.exec(containerXml)
    if (!opfPathMatch) throw new Error('No OPF path in container.xml')
    const opfPath = opfPathMatch[1]
    const opfDir = path.posix.dirname(opfPath)

    // 2. Parse the OPF for Dublin Core metadata
    const opfEntry = zip.getEntry(opfPath)
    if (!opfEntry) throw new Error('OPF file not found: ' + opfPath)
    const opfXml = opfEntry.getData().toString('utf-8')

    const get = (tag: string): string | undefined => {
      const re = new RegExp(`<dc:${tag}[^>]*>([^<]+)<\\/dc:${tag}>`, 'i')
      return re.exec(opfXml)?.[1]?.trim()
    }

    const title = get('title') || path.basename(filePath, '.epub')
    const author = get('creator') || 'Unknown'
    const description = get('description')
    const publisher = get('publisher')
    const language = get('language')
    const publishedDate = get('date')

    // 3. Extract cover image
    let coverUrl: string | undefined
    try {
      coverUrl = extractEpubCover(zip, opfXml, opfDir, bookId)
    } catch (err) {
      console.log('[metadata] cover extraction failed:', err)
    }

    return { title, author, description, publisher, language, publishedDate, coverUrl }
  } catch (err) {
    console.log('[metadata] EPUB parse failed:', err)
    return { title: path.basename(filePath, '.epub'), author: 'Unknown' }
  }
}

function extractEpubCover(
  zip: AdmZip,
  opfXml: string,
  opfDir: string,
  bookId: string
): string | undefined {
  // Strategy 1: Look for <meta name="cover" content="cover-id"/>
  // then find <item id="cover-id" href="..."/>
  const coverMetaMatch = /<meta\s[^>]*name\s*=\s*"cover"[^>]*content\s*=\s*"([^"]+)"/i.exec(opfXml)
    || /<meta\s[^>]*content\s*=\s*"([^"]+)"[^>]*name\s*=\s*"cover"/i.exec(opfXml)

  let coverHref: string | undefined

  if (coverMetaMatch) {
    const coverId = coverMetaMatch[1]
    const itemRe = new RegExp(`<item\\s[^>]*id\\s*=\\s*"${coverId}"[^>]*href\\s*=\\s*"([^"]+)"`, 'i')
    const altRe = new RegExp(`<item\\s[^>]*href\\s*=\\s*"([^"]+)"[^>]*id\\s*=\\s*"${coverId}"`, 'i')
    coverHref = itemRe.exec(opfXml)?.[1] || altRe.exec(opfXml)?.[1]
  }

  // Strategy 2: Look for <item properties="cover-image" href="..."/>
  if (!coverHref) {
    const propsMatch = /<item\s[^>]*properties\s*=\s*"cover-image"[^>]*href\s*=\s*"([^"]+)"/i.exec(opfXml)
      || /<item\s[^>]*href\s*=\s*"([^"]+)"[^>]*properties\s*=\s*"cover-image"/i.exec(opfXml)
    coverHref = propsMatch?.[1]
  }

  // Strategy 3: Look for common cover filenames
  if (!coverHref) {
    const commonNames = ['cover.jpg', 'cover.jpeg', 'cover.png', 'Cover.jpg', 'Cover.jpeg', 'Cover.png', 'images/cover.jpg', 'Images/cover.jpg']
    for (const name of commonNames) {
      const tryPath = opfDir ? `${opfDir}/${name}` : name
      if (zip.getEntry(tryPath)) {
        coverHref = name
        break
      }
    }
  }

  if (!coverHref) return undefined

  // Resolve the cover path relative to the OPF directory
  const coverPath = opfDir ? `${opfDir}/${coverHref}` : coverHref
  const coverEntry = zip.getEntry(coverPath) || zip.getEntry(coverHref)
  if (!coverEntry) return undefined

  // Save cover to covers directory
  const coverData = coverEntry.getData()
  const ext = path.extname(coverHref).toLowerCase() || '.jpg'
  const coverFile = path.join(getCoversDir(), `${bookId}${ext}`)
  fs.writeFileSync(coverFile, coverData)

  return `file://${coverFile.replace(/\\/g, '/')}`
}

function extractPdfMetadata(filePath: string): BookMetadata {
  try {
    const buf = fs.readFileSync(filePath)
    const text = buf.toString('latin1')

    const get = (key: string): string | undefined => {
      const re = new RegExp(`/${key}\\s*\\(([^)]+)\\)`)
      return re.exec(text)?.[1]?.trim()
    }

    const title = get('Title') || path.basename(filePath, '.pdf')
    const author = get('Author') || 'Unknown'
    const description = get('Subject')
    const publisher = get('Creator')

    return { title, author, description, publisher }
  } catch {
    return { title: path.basename(filePath, '.pdf'), author: 'Unknown' }
  }
}

function extractTextMetadata(filePath: string): BookMetadata {
  const ext = path.extname(filePath)
  return {
    title: path.basename(filePath, ext),
    author: 'Unknown',
  }
}
