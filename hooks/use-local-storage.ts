"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Persists a piece of state to localStorage.
 *
 * Returns [value, setValue] like useState. SSR-safe:
 *  - Initial render uses `initialValue` to match server output (no hydration mismatch).
 *  - After mount, the persisted value is loaded from localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Load persisted value after mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch (err) {
      console.warn(`[v0] useLocalStorage failed to read "${key}":`, err)
    } finally {
      setHydrated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on change (only after hydration to avoid clobbering)
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`[v0] useLocalStorage failed to write "${key}":`, err)
    }
  }, [key, value, hydrated])

  const setStableValue = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next)
  }, [])

  return [value, setStableValue]
}
