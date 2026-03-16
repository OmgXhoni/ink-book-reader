import { useEffect, useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'

interface UsePdfOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialPage?: number
}

async function renderPageToWrapper(
  pageNum: number,
  pdf: PDFDocumentProxy,
  wrapper: HTMLDivElement,
  containerWidth: number,
  containerHeight: number,
  zoomLevel: number,
  theme: string,
) {
  const page = await pdf.getPage(pageNum)
  const baseViewport = page.getViewport({ scale: 1 })
  const scaleW = (containerWidth - 48) / baseViewport.width
  const scaleH = (containerHeight - 48) / baseViewport.height
  const scale = Math.min(scaleW, scaleH) * zoomLevel
  const viewport = page.getViewport({ scale })
  const dpr = window.devicePixelRatio || 1

  // Canvas
  let canvas = wrapper.querySelector('canvas') as HTMLCanvasElement
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.pointerEvents = 'none'
    wrapper.appendChild(canvas)
  }
  canvas.width = Math.floor(viewport.width * dpr)
  canvas.height = Math.floor(viewport.height * dpr)
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  ctx.fillStyle = resolvedTheme === 'dark' ? '#1a1a1a' : resolvedTheme === 'sepia' ? '#f4ecd8' : '#ffffff'
  ctx.fillRect(0, 0, viewport.width, viewport.height)
  await page.render({ canvasContext: ctx, viewport }).promise
}

export function usePdf({ bookId, containerRef, initialPage = 1 }: UsePdfOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const zoomIn = useCallback(() => setZoomLevel(z => Math.min(+(z + 0.15).toFixed(2), 3.0)), [])
  const zoomOut = useCallback(() => setZoomLevel(z => Math.max(+(z - 0.15).toFixed(2), 0.3)), [])
  const pdfRef = useRef<PDFDocumentProxy | null>(null)
  const { settings } = useSettingsStore()
  const { saveProgress } = useProgress(bookId)
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage

  // Load PDF
  useEffect(() => {
    let destroyed = false
    setIsLoading(true)
    setError(null)

    const initPdf = async () => {
      try {
        const buffer = await window.electronAPI.getFileBuffer(bookId)
        const pdfjsLib = await import('pdfjs-dist')
        const resolvedUrl = new URL(pdfWorkerUrl, window.location.href).href
        pdfjsLib.GlobalWorkerOptions.workerSrc = resolvedUrl.includes('app.asar/')
          ? resolvedUrl.replace('app.asar/', 'app.asar.unpacked/')
          : resolvedUrl
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
        pdfRef.current = pdf
        if (!destroyed) {
          setTotalPages(pdf.numPages)
          setCurrentPage(initialPage)
          setIsLoading(false)
        }
      } catch (err) {
        if (!destroyed) { setError(String(err)); setIsLoading(false) }
      }
    }

    initPdf()
    return () => {
      destroyed = true
      pdfRef.current?.destroy()
      pdfRef.current = null
    }
  }, [bookId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Render all pages once loaded
  useEffect(() => {
    if (isLoading || !containerRef.current || !pdfRef.current) return

    const container = containerRef.current
    const pdf = pdfRef.current
    container.innerHTML = ''
    container.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:20px; padding:24px;'

    // Create placeholder wrappers for all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const wrapper = document.createElement('div')
      wrapper.className = 'pdf-page-wrapper'
      wrapper.dataset.page = String(i)
      wrapper.style.cssText = 'position:relative; display:block; line-height:0;'
      container.appendChild(wrapper)
    }

    // Render all pages sequentially
    let cancelled = false
    ;(async () => {
      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled || !pdfRef.current) break
        const wrapper = container.querySelector<HTMLDivElement>(`[data-page="${i}"]`)
        if (wrapper) {
          await renderPageToWrapper(i, pdf, wrapper, container.clientWidth, container.clientHeight, zoomLevel, settings.theme)
        }
      }
    })()

    // Scroll to initial page
    if (initialPage > 1) {
      setTimeout(() => {
        const wrapper = container.querySelector<HTMLDivElement>(`[data-page="${initialPage}"]`)
        wrapper?.scrollIntoView({ block: 'start' })
      }, 100)
    }

    return () => { cancelled = true }
  }, [isLoading, zoomLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track current page via scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container || isLoading) return

    const handleScroll = () => {
      const wrappers = container.querySelectorAll<HTMLDivElement>('.pdf-page-wrapper')
      let bestPage = currentPageRef.current
      let bestOverlap = -1
      const cTop = container.scrollTop
      const cBottom = cTop + container.clientHeight

      wrappers.forEach(wrapper => {
        const top = wrapper.offsetTop
        const bottom = top + wrapper.offsetHeight
        const overlap = Math.min(bottom, cBottom) - Math.max(top, cTop)
        if (overlap > bestOverlap) {
          bestOverlap = overlap
          bestPage = parseInt(wrapper.dataset.page || '1')
        }
      })

      if (bestPage !== currentPageRef.current) {
        setCurrentPage(bestPage)
        const percentage = Math.round((bestPage / (pdfRef.current?.numPages || 1)) * 100)
        saveProgress(String(bestPage), percentage, pdfRef.current?.numPages)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isLoading, saveProgress])

  const goToPage = useCallback((page: number) => {
    if (!containerRef.current || !pdfRef.current) return
    const clamped = Math.max(1, Math.min(page, pdfRef.current.numPages))
    const wrapper = containerRef.current.querySelector<HTMLDivElement>(`[data-page="${clamped}"]`)
    if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const nextPage = useCallback(() => {
    goToPage(currentPageRef.current + 1)
  }, [goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPageRef.current - 1)
  }, [goToPage])

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
        results.push({ page: i, excerpt: `...${excerpt}...`, index: results.length })
        idx = text.toLowerCase().indexOf(queryLower, idx + 1)
      }
    }
    return results
  }, [])

  return { isLoading, error, currentPage, totalPages, nextPage, prevPage, goToPage, search, zoomLevel, zoomIn, zoomOut }
}
