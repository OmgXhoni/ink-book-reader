export type ThemeMode = 'light' | 'dark' | 'sepia' | 'system'
export type ReaderFlow = 'paginated' | 'scrolling'
export type MarginSize = 'small' | 'medium' | 'large'
export type ColorScheme = 'default' | 'warm' | 'cool'

export interface AppSettings {
  theme: ThemeMode
  fontSize: number
  fontFamily: string
  fontVariant?: string
  fontWeight?: number
  bundledFamilyId?: string
  lineHeight: number
  readerFlow: ReaderFlow
  marginSize: MarginSize
  colorScheme: ColorScheme
}
