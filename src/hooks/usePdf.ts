import { useEffect, useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgress } from './useProgress'
import type { SearchResult } from '@/store/readerStore'
import type { Highlight, HighlightColor } from '@/types/progress'

interface UsePdfOptions {
  bookId: string
  containerRef: React.RefObject<HTMLDivElement>
  initialPage?: number
  highlights?: Highlight[]
}

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 220, 0, 0.45)',
  red: 'rgba(255, 80, 80, 0.45)',
  blue: 'rgba(80, 140, 255, 0.45)',
  green: 'rgba(80, 200, 100, 0.45)',
  pink: 'rgba(255, 100, 180, 0.45)',
}

function injectTextLayerStyles() {
  if (document.querySelector('#pdf-text-layer-styles')) return
  const style = document.createElement('style')
  style.id = 'pdf-text-layer-styles'
  style.textContent = `
    .pdf-text-layer {
      position: absolute; top: 0; left: 0;
      overflow: visible;
      pointer-events: auto;
      -webkit-user-select: none;
      user-select: none;
      z-index: 2;
      line-height: 1;
      cursor: text;
    }
    .pdf-text-layer span,
    .pdf-text-layer br {
      position: absolute;
      white-space: pre;
      cursor: text;
      transform-origin: 0% 0%;
      color: transparent;
      pointer-events: auto !important;
      -webkit-user-select: text !important;
      user-select: text !important;
    }
    .pdf-text-layer span::selection {
      background: rgba(0, 120, 255, 0.35);
      color: transparent;
    }
    .pdf-highlight-overlay {
      position: absolute;
      pointer-events: none;
      z-index: 1;
      border-radius: 2px;
    }
  `
  document.head.appendChild(style)
}

function mergeRects(rects: { x: number; y: number; w: number; h: number }[]) {
  // Merge rects that are on the same visual line (same Y ± 2px) to avoid double-painting
  const merged: typeof rects = []
  for (const r of rects) {
    const existing = merged.find(m => Math.abs(m.y - r.y) < 3 && Math.abs(m.h - r.h) < 3)
    if (existing) {
      const right = Math.max(existing.x + existing.w, r.x + r.w)
      existing.x = Math.min(existing.x, r.x)
      existing.w = right - existing.x
    } else {
      merged.push({ ...r })
    }
  }
  return merged
}

function applyHighlightsToLayer(wrapper: HTMLDivElement, pageNum: number, hlList: Highlight[]) {
  wrapper.querySelectorAll('.pdf-highlight-overlay').forEach(el => el.remove())

  const wrapperH = wrapper.offsetHeight || Infinity
  const wrapperW = wrapper.offsetWidth || Infinity

  const pageHighlights = hlList.filter(h => h.cfiRange === `pdf:page:${pageNum}`)
  for (const h of pageHighlights) {
    if (!h.rects?.length) continue
    // Clip rects to page bounds and merge same-line rects
    const clipped = h.rects.filter(r => r.y >= 0 && r.x >= 0 && r.y < wrapperH && r.x < wrapperW && r.w > 0 && r.h > 0)
    for (const r of mergeRects(clipped)) {
      const div = document.createElement('div')
      div.className = 'pdf-highlight-overlay'
      div.style.left = `${r.x}px`
      div.style.top = `${r.y}px`
      div.style.width = `${Math.min(r.w, wrapperW - r.x)}px`
      div.style.height = `${Math.min(r.h, wrapperH - r.y)}px`
      div.style.background = COLOR_MAP[h.color] || COLOR_MAP.yellow
      wrapper.appendChild(div)
    }
  }
}

async function renderPageToWrapper(
  pageNum: number,
  pdf: PDFDocumentProxy,
  wrapper: HTMLDivElement,
  containerWidth: number,
  theme: string,
) {
  const page = await pdf.getPage(pageNum)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = (containerWidth - 48) / baseViewport.width
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

  // Text layer
  const textContent = await page.getTextContent()
  let textLayerDiv = wrapper.querySelector('.pdf-text-layer') as HTMLDivElement
  if (!textLayerDiv) {
    textLayerDiv = document.createElement('div')
    textLayerDiv.className = 'pdf-text-layer'
    wrapper.appendChild(textLayerDiv)
  }
  textLayerDiv.innerHTML = ''
  textLayerDiv.style.width = `${viewport.width}px`
  textLayerDiv.style.height = `${viewport.height}px`

  const pdfjsLib = await import('pdfjs-dist')
  const textLayer = new pdfjsLib.TextLayer({ textContentSource: textContent, container: textLayerDiv, viewport })
  await textLayer.render()

  // Ensure --scale-factor is set (pdfjs should set it, but be explicit)
  if (!textLayerDiv.style.getPropertyValue('--scale-factor')) {
    textLayerDiv.style.setProperty('--scale-factor', String(viewport.scale))
  }

  // Force selectable inline styles on spans only (not the container)
  textLayerDiv.querySelectorAll<HTMLElement>('span, br').forEach(el => {
    el.style.pointerEvents = 'auto'
    el.style.userSelect = 'text'
    ;(el.style as unknown as Record<string, string>).webkitUserSelect = 'text'
    el.style.color = 'transparent'
  })

  // Highlights are applied by the re-apply effect, not here (avoids stale closure)
}

export function usePdf({ bookId, containerRef, initialPage = 1, highlights = [] }: UsePdfOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
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
    injectTextLayerStyles()

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
          await renderPageToWrapper(i, pdf, wrapper, container.clientWidth, settings.theme)
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
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply highlights when they change
  useEffect(() => {
    if (!containerRef.current || isLoading) return
    const container = containerRef.current
    // Clear ALL overlays from ALL pages first (handles deletion and avoids duplicates)
    container.querySelectorAll('.pdf-highlight-overlay').forEach(el => el.remove())
    // Re-add overlays for all current highlights
    const affectedPages = new Set(
      highlights.map(h => h.cfiRange.match(/^pdf:page:(\d+)$/)?.[1]).filter(Boolean)
    )
    affectedPages.forEach(p => {
      const wrapper = container.querySelector<HTMLDivElement>(`[data-page="${p}"]`)
      if (wrapper) applyHighlightsToLayer(wrapper, parseInt(p!), highlights)
    })
  }, [highlights, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return { isLoading, error, currentPage, totalPages, nextPage, prevPage, goToPage, search }
}
