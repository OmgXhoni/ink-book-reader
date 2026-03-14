export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  shadow: boolean
): void {
  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }
  ctx.fillText(text, x, y)
  if (shadow) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

export function applyImageFilter(
  ctx: CanvasRenderingContext2D,
  blur: number,
  overlayOpacity: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`
  }
  ctx.filter = 'none'

  // Draw overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
