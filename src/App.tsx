import React, { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useSettingsStore } from '@/store/settingsStore'
import { useTheme } from '@/hooks/useTheme'
import { useFonts } from '@/hooks/useFonts'
import { useLibraryStore } from '@/store/libraryStore'
import { useReaderStore } from '@/store/readerStore'

function App() {
  const { loadSettings } = useSettingsStore()
  const { addBooks } = useLibraryStore()
  const { openBook } = useReaderStore()

  // Initialize theme
  useTheme()

  // Initialize fonts
  useFonts()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Handle file associations
  useEffect(() => {
    const unsubscribe = window.electronAPI.onFileOpened(async (filePath) => {
      await useLibraryStore.getState().addBooks([filePath])
      const allBooks = useLibraryStore.getState().books
      const book = allBooks.find(b => b.filePath === filePath)
      if (book) {
        await openBook(book)
      }
    })
    return unsubscribe
  }, [openBook])

  return <AppShell />
}

export default App
