import { create } from 'zustand'
import type { Book, BookMetadata } from '@/types/book'

export type ViewMode = 'grid' | 'list'
export type SortBy = 'dateAdded' | 'lastOpened' | 'title' | 'author'
export type FilterMode = 'all' | 'recents' | 'new' | 'inProgress' | 'finished' | 'length' | 'titleAZ' | 'authorAZ'

interface LibraryState {
  books: Book[]
  selectedBookId: string | null
  searchQuery: string
  viewMode: ViewMode
  sortBy: SortBy
  filterMode: FilterMode
  isLoading: boolean
  error: string | null

  // Computed
  filteredBooks: Book[]

  // Actions
  loadLibrary: () => Promise<void>
  addBooks: (filePaths: string[]) => Promise<void>
  removeBook: (bookId: string) => Promise<void>
  selectBook: (bookId: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sort: SortBy) => void
  setFilterMode: (mode: FilterMode) => void
  updateMetadata: (bookId: string, metadata: Partial<BookMetadata>) => Promise<void>
  openAddBookDialog: () => Promise<void>
}

function filterAndSort(books: Book[], query: string, sortBy: SortBy): Book[] {
  let filtered = books
  if (query.trim()) {
    const q = query.toLowerCase()
    filtered = books.filter(
      b =>
        b.metadata.title.toLowerCase().includes(q) ||
        b.metadata.author.toLowerCase().includes(q) ||
        b.metadata.description?.toLowerCase().includes(q)
    )
  }

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.metadata.title.localeCompare(b.metadata.title)
      case 'author':
        return a.metadata.author.localeCompare(b.metadata.author)
      case 'lastOpened':
        if (!a.lastOpened && !b.lastOpened) return 0
        if (!a.lastOpened) return 1
        if (!b.lastOpened) return -1
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
      case 'dateAdded':
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
  })
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  selectedBookId: null,
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'dateAdded',
  filterMode: 'all',
  isLoading: false,
  error: null,
  filteredBooks: [],

  loadLibrary: async () => {
    set({ isLoading: true, error: null })
    try {
      const books = await window.electronAPI.getAllBooks() as Book[]
      const { searchQuery, sortBy } = get()
      set({
        books,
        filteredBooks: filterAndSort(books, searchQuery, sortBy),
        isLoading: false,
      })
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  addBooks: async (filePaths) => {
    set({ isLoading: true })
    try {
      const addedBooks: Book[] = []
      for (const filePath of filePaths) {
        const book = await window.electronAPI.addBook(filePath) as Book
        addedBooks.push(book)
      }
      const { books, searchQuery, sortBy } = get()
      const newBooks = [...books, ...addedBooks]
      set({
        books: newBooks,
        filteredBooks: filterAndSort(newBooks, searchQuery, sortBy),
        isLoading: false,
      })
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  removeBook: async (bookId) => {
    await window.electronAPI.deleteBook(bookId)
    const { books, searchQuery, sortBy, selectedBookId } = get()
    const newBooks = books.filter(b => b.id !== bookId)
    set({
      books: newBooks,
      filteredBooks: filterAndSort(newBooks, searchQuery, sortBy),
      selectedBookId: selectedBookId === bookId ? null : selectedBookId,
    })
  },

  selectBook: (bookId) => {
    set({ selectedBookId: bookId })
  },

  setSearchQuery: (query) => {
    const { books, sortBy } = get()
    set({
      searchQuery: query,
      filteredBooks: filterAndSort(books, query, sortBy),
    })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilterMode: (mode) => set({ filterMode: mode }),

  setSortBy: (sort) => {
    const { books, searchQuery } = get()
    set({
      sortBy: sort,
      filteredBooks: filterAndSort(books, searchQuery, sort),
    })
  },

  updateMetadata: async (bookId, metadata) => {
    const updated = await window.electronAPI.updateMetadata(bookId, metadata as Record<string, unknown>) as Book
    const { books, searchQuery, sortBy } = get()
    const newBooks = books.map(b => b.id === bookId ? updated : b)
    set({
      books: newBooks,
      filteredBooks: filterAndSort(newBooks, searchQuery, sortBy),
    })
  },

  openAddBookDialog: async () => {
    const filePaths = await window.electronAPI.openBookDialog()
    if (filePaths.length > 0) {
      await get().addBooks(filePaths)
    }
  },
}))
