import Store from 'electron-store'
import type { Book } from '../../src/types/book'
import type { ReadingProgress, Bookmark, Highlight } from '../../src/types/progress'
import type { AppSettings } from '../../src/types/settings'
import type { CustomFont } from '../../src/types/font'

interface StoreSchema {
  library: Book[]
  progress: Record<string, ReadingProgress>
  bookmarks: Record<string, Bookmark[]>
  highlights: Record<string, Highlight[]>
  settings: AppSettings
  fonts: CustomFont[]
}

const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 18,
  fontFamily: 'Georgia',
  lineHeight: 1.6,
  readerFlow: 'paginated',
  marginSize: 'medium',
  colorScheme: 'default',
}

export const store = new Store<StoreSchema>({
  name: 'store',
  defaults: {
    library: [],
    progress: {},
    bookmarks: {},
    highlights: {},
    settings: defaultSettings,
    fonts: [],
  },
})
