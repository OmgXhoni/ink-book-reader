import { useEffect, useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'

interface UsePdfOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialPage?: number
}

export function usePdf({ bookId, containerRef, initialPage = 1 }: UsePdfOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const { settings } = useSettingsStore()
  const { saveProgress } = useProgress(bookId)
  const renderingRef = useRef(false)

  const renderPage = useCallback(async (pageNum: number, container: HTMLDivElement) => {
    if (!pdfRef.current || renderingRef.current) return
    renderingRef.current = true

    try {
      const page = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale: window.devicePixelRatio || 1 })
      const containerWidth = container.clientWidth - 48 // padding
      const scale = containerWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })

      // Create/reuse canvas
      let canvas = container.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) {
        canvas = document.createElement('canvas')
        canvas.style.maxWidth = '100%'
        canvas.style.display = 'block'
        canvas.style.margin = '0 auto'
        container.appendChild(canvas)
      }

      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const ctx = canvas.getContext('2d')!

      // Apply theme background
      ctx.fillStyle = settings.theme === 'dark' ? '#1a1a1a' : settings.theme === 'sepia' ? '#f4ecd8' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise

      renderingRef.current = false

      const percentage = Math.round((pageNum / (pdfRef.current?.numPages || 1)) * 100)
      saveProgress(String(pageNum), percentage, pdfRef.current?.numPages)
    } catch (err) {
      renderingRef.current = false
      console.error('PDF render error:', err)
    }
  }, [settings.theme, saveProgress])

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    const initPdf = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const pdfjsLib = await import('pdfjs-dist')

        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).toString()

        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
        pdfRef.current = pdf

        if (!destroyed) {
          setTotalPages(pdf.numPages)
          setCurrentPage(initialPage)
          setIsLoading(false)
        }
      } catch (err) {
        if (!destroyed) {
          setError(String(err))
          setIsLoading(false)
        }
      }
    }

    initPdf()

    return () => {
      destroyed = true
      pdfRef.current?.destroy()
      pdfRef.current = null
    }
  }, [bookId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (containerRef.current && !isLoading && pdfRef.current) {
      renderPage(currentPage, containerRef.current)
    }
  }, [currentPage, isLoading, renderPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, pdfRef.current?.numPages || 1))
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1))
  }, [])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pdfRef.current?.numPages || 1)))
  }, [])

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!pdfRef.current || !query.trim()) return []

    const results: SearchResult[] = []
    const numPages = pdfRef.current.numPages

    for (let i = 1; i <= numPages && results.length < 100; i++) {
      const page = await pdfRef.current.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map((item: unknown) => (item as { str: string }).str).join(' ')
      const queryLower = query.toLowerCase()
      let idx = text.toLowerCase().indexOf(queryLower)

      while (idx !== -1 && results.length < 100) {
        const excerpt = text.slice(Math.max(0, idx - 30), idx + query.length + 30)
        results.push({
          page: i,
          excerpt: `...${excerpt}...`,
          index: results.length,
        })
        idx = text.toLowerCase().indexOf(queryLower, idx + 1)
      }
    }

    return results
  }, [])

  return {
    isLoading,
    error,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    search,
  }
}
