const MEASURE_STRING = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Baseline width using Georgia (the default font) at normal weight
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!
ctx.font = '400 16px Georgia'
export const REFERENCE_WIDTH = ctx.measureText(MEASURE_STRING).width

export function measureFontWidth(fontFamily: string, fontWeight: number = 400): number {
  const c = document.createElement('canvas').getContext('2d')!
  c.font = `${fontWeight} 16px "${fontFamily}"`
  return c.measureText(MEASURE_STRING).width
}

/** Scale a base page count by font size, font family width, and weight */
export function scaleTotalPages(base: number, fontSize: number, fontFamily: string, fontWeight?: number): number {
  if (!base) return 0
  const fontSizeScale = fontSize / 24
  // Native font: no width scaling (uses EPUB's own font)
  const fontWidthScale = fontFamily === '__native__' ? 1 : measureFontWidth(fontFamily, fontWeight) / REFERENCE_WIDTH
  return Math.ceil(base * fontSizeScale * fontWidthScale)
}
