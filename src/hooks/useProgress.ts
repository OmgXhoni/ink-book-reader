import { useCallback, useRef } from 'react'
import { useReaderStore } from '@/store/readerStore'
import type { ReadingProgress } from '@/types/progress'

export function useProgress(bookId: string) {
  const { updateProgress } = useReaderStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveProgress = useCallback(
    (position: string, percentage: number, totalPages?: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const progress: ReadingProgress = {
          bookId,
          position,
          percentage,
          lastRead: new Date().toISOString(),
          totalPages,
        }
        updateProgress(progress)
      }, 1000) // Debounce 1 second
    },
    [bookId, updateProgress]
  )

  return { saveProgress }
}
