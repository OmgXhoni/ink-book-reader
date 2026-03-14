export type QuoteBackground =
  | { type: 'color'; value: string }
  | { type: 'image'; url: string; blur?: number; opacity?: number }

export interface QuoteTextStyle {
  fontFamily: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right'
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  lineHeight: number
  shadow: boolean
}

export interface QuoteTemplate {
  id: string
  name: string
  background: QuoteBackground
  textStyle: QuoteTextStyle
  padding: number
  attributionStyle: Partial<QuoteTextStyle>
  showQuoteMark: boolean
}

export type AspectRatio = '1:1' | '16:9' | '4:5' | '9:16'

export interface QuoteConfig {
  text: string
  attribution: string
  background: QuoteBackground
  textStyle: QuoteTextStyle
  canvasWidth: number
  canvasHeight: number
  padding: number
  showQuoteMark: boolean
  template: string
}

export const ASPECT_RATIOS: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '1:1': { width: 1080, height: 1080, label: '1:1 (1080×1080)' },
  '16:9': { width: 1920, height: 1080, label: '16:9 (1920×1080)' },
  '4:5': { width: 1080, height: 1350, label: '4:5 (1080×1350)' },
  '9:16': { width: 1080, height: 1920, label: '9:16 (1080×1920)' },
}
