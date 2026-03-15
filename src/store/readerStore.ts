import { create } from 'zustand'
import type { Book } from '@/types/book'
import type { ReadingProgress, Bookmark, Highlight, HighlightColor } from '@/types/progress'

export interface SearchResult {
  cfi?: string
  page?: number
  excerpt: string
  index: number
}

interface ReaderState {
  activeBook: Book | null
  progress: ReadingProgress | null
  livePercentage: number
  liveTotalPages: number | undefined
  bookmarks: Bookmark[]
  highlights: Highlight[]
  searchResults: SearchResult[]
  currentSearchIndex: number
  isTocOpen: boolean
  isAnnotationPanelOpen: boolean
  isSearchOpen: boolean

  // Actions
  openBook: (book: Book) => Promise<void>
  closeBook: () => void
  updateProgress: (progress: ReadingProgress) => Promise<void>
  loadBookmarks: (bookId: string) => Promise<void>
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>
  removeBookmark: (bookmarkId: string) => Promise<void>
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>
  removeHighlight: (highlightId: string) => Promise<void>
  setSearchResults: (results: SearchResult[]) => void
  navigateResult: (index: number) => void
  clearSearch: () => void
  setTocOpen: (open: boolean) => void
  setAnnotationPanelOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  activeBook: null,
  progress: null,
  livePercentage: 0,
  liveTotalPages: undefined,
  bookmarks: [],
  highlights: [],
  searchResults: [],
  currentSearchIndex: 0,
  isTocOpen: false,
  isAnnotationPanelOpen: false,
  isSearchOpen: false,

  openBook: async (book) => {
    await window.electronAPI.updateLastOpened(book.id)
    const progress = await window.electronAPI.getProgress(book.id) as ReadingProgress | null
    const bookmarks = await window.electronAPI.getBookmarks(book.id) as Bookmark[]
    const highlights = await window.electronAPI.getHighlights(book.id) as Highlight[]
    set({
      activeBook: book,
      progress,
      livePercentage: progress?.percentage ?? 0,
      liveTotalPages: progress?.totalPages,
      bookmarks,
      highlights,
      searchResults: [],
      currentSearchIndex: 0,
      isTocOpen: false,
    })
  },

  closeBook: () => {
    set({
      activeBook: null,
      progress: null,
      livePercentage: 0,
      liveTotalPages: undefined,
      bookmarks: [],
      highlights: [],
      searchResults: [],
      isTocOpen: false,
    })
  },

  updateProgress: async (progress) => {
    const { activeBook } = get()
    if (!activeBook) return
    await window.electronAPI.saveProgress(activeBook.id, progress)
    set({ progress, livePercentage: progress.percentage, liveTotalPages: progress.totalPages })
  },

  loadBookmarks: async (bookId) => {
    const bookmarks = await window.electronAPI.getBookmarks(bookId) as Bookmark[]
    set({ bookmarks })
  },

  addBookmark: async (bookmark) => {
    const { activeBook } = get()
    if (!activeBook) return
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const saved = await window.electronAPI.addBookmark(activeBook.id, newBookmark) as Bookmark
    set(state => ({ bookmarks: [...state.bookmarks, saved] }))
  },

  removeBookmark: async (bookmarkId) => {
    const { activeBook } = get()
    if (!activeBook) return
    await window.electronAPI.removeBookmark(activeBook.id, bookmarkId)
    set(state => ({ bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId) }))
  },

  addHighlight: async (highlight) => {
    const { activeBook } = get()
    if (!activeBook) return
    const newHighlight: Highlight = {
      ...highlight,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const saved = await window.electronAPI.addHighlight(activeBook.id, newHighlight) as Highlight
    set(state => ({ highlights: [...state.highlights, saved] }))
  },

  removeHighlight: async (highlightId) => {
    const { activeBook } = get()
    if (!activeBook) return
    await window.electronAPI.removeHighlight(activeBook.id, highlightId)
    set(state => ({ highlights: state.highlights.filter(h => h.id !== highlightId) }))
  },

  setSearchResults: (results) => set({ searchResults: results, currentSearchIndex: 0 }),

  navigateResult: (index) => set({ currentSearchIndex: index }),

  clearSearch: () => set({ searchResults: [], currentSearchIndex: 0 }),

  setTocOpen: (open) => set({ isTocOpen: open }),
  setAnnotationPanelOpen: (open) => set({ isAnnotationPanelOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}))
