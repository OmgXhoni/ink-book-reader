import React, { useEffect } from 'react'
import { useQuoteCanvas } from '@/hooks/useQuoteCanvas'
import type { QuoteConfig } from '@/types/quote'

interface QuoteCanvasProps {
  config: QuoteConfig
  onCanvasReady?: (exportFn: (format?: 'png' | 'jpeg') => string) => void
}

export function QuoteCanvas({ config, onCanvasReady }: QuoteCanvasProps) {
  const { canvasRef, renderCanvas, exportDataUrl } = useQuoteCanvas()

  useEffect(() => {
    if (config.text || config.background) {
      renderCanvas(config)
    }
  }, [config, renderCanvas])

  useEffect(() => {
    onCanvasReady?.(exportDataUrl)
  }, [exportDataUrl, onCanvasReady])

  // Compute aspect ratio for container
  const aspectRatio = config.canvasWidth / config.canvasHeight

  return (
    <div
      className="relative w-full bg-neutral-900 rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: `${config.canvasWidth} / ${config.canvasHeight}` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
