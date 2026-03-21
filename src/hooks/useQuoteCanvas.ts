import { useCallback, useRef } from 'react'
import type { QuoteConfig } from '@/types/quote'
import { wrapText, drawTextWithShadow, loadImage } from '@/utils/canvasUtils'

export function useQuoteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const renderCanvas = useCallback(async (config: QuoteConfig): Promise<void> => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { canvasWidth, canvasHeight, background, textStyle, text, attribution, padding, showQuoteMark } = config

    // Use scale for preview canvas
    const scale = Math.min(canvas.offsetWidth / canvasWidth, canvas.offsetHeight / canvasHeight) || 1
    canvas.width = canvasWidth * scale
    canvas.height = canvasHeight * scale

    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    // Draw background
    if (background.type === 'color') {
      ctx.fillStyle = background.value
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    } else if (background.type === 'image') {
      try {
        const img = await loadImage(background.url)

        // Cover fit
        const aspectRatio = img.width / img.height
        const canvasAspect = canvasWidth / canvasHeight
        let drawW = canvasWidth
        let drawH = canvasHeight
        let drawX = 0
        let drawY = 0

        if (aspectRatio > canvasAspect) {
          drawW = canvasHeight * aspectRatio
          drawX = (canvasWidth - drawW) / 2
        } else {
          drawH = canvasWidth / aspectRatio
          drawY = (canvasHeight - drawH) / 2
        }

        if (background.blur && background.blur > 0) {
          ctx.filter = `blur(${background.blur}px)`
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.filter = 'none'

        // Overlay
        if (background.opacity && background.opacity > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${background.opacity})`
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        }
      } catch {
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      }
    }

    // Draw quote mark
    let textStartY = padding
    if (showQuoteMark) {
      ctx.font = `bold ${Math.round(canvasWidth * 0.12)}px ${textStyle.fontFamily}`
      ctx.fillStyle = `${textStyle.color}40`
      ctx.textAlign = 'left'
      ctx.fillText('\u201C', padding - 10, padding + Math.round(canvasWidth * 0.06))
      textStartY = padding + Math.round(canvasWidth * 0.05)
    }

    // Draw quote text
    const fontSize = Math.round(textStyle.fontSize * (canvasWidth / 1080))
    ctx.font = `${textStyle.fontStyle} ${textStyle.fontWeight} ${fontSize}px "${textStyle.fontFamily}", serif`
    ctx.fillStyle = textStyle.color
    ctx.textAlign = textStyle.textAlign
    ctx.textBaseline = 'top'

    const textX =
      textStyle.textAlign === 'center'
        ? canvasWidth / 2
        : textStyle.textAlign === 'right'
        ? canvasWidth - padding
        : padding

    const maxWidth = canvasWidth - padding * 2
    const lines = wrapText(ctx, text, maxWidth)
    const lineHeight = fontSize * textStyle.lineHeight

    let y = textStartY
    for (const line of lines) {
      drawTextWithShadow(ctx, line, textX, y, textStyle.shadow)
      y += lineHeight
    }

    // Attribution
    if (attribution) {
      const attrFontSize = Math.round(fontSize * 0.55)
      ctx.font = `${attrFontSize}px "${textStyle.fontFamily}", sans-serif`
      ctx.fillStyle = `${textStyle.color}cc`
      ctx.textAlign = textStyle.textAlign

      const attrY = canvasHeight - padding - attrFontSize * 2
      const attrLines = wrapText(ctx, `— ${attribution}`, maxWidth)
      let attrCurrentY = attrY
      for (const line of attrLines) {
        drawTextWithShadow(ctx, line, textX, attrCurrentY, textStyle.shadow)
        attrCurrentY += attrFontSize * 1.4
      }
    }

    // Ink attribution watermark (small, bottom corner)
    const watermarkSize = Math.round(canvasWidth * 0.012)
    ctx.font = `${watermarkSize}px sans-serif`
    ctx.fillStyle = `${textStyle.color}60`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Ink', canvasWidth - padding / 2, canvasHeight - padding / 4)
  }, [])

  const exportDataUrl = useCallback((format: 'png' | 'jpeg' = 'png'): string => {
    const canvas = canvasRef.current
    if (!canvas) return ''
    return canvas.toDataURL(`image/${format}`, 0.95)
  }, [])

  return { canvasRef, renderCanvas, exportDataUrl }
}
