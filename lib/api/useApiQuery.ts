'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface ApiQuery<T> {
  /** Latest successful data. Kept while a new request is in flight, so the UI doesn't flash. */
  data: T | undefined
  /** Error from the current request, if it failed. */
  error: unknown
  /** True while the current request is in flight (including refetches with stale data shown). */
  isFetching: boolean
  retry: () => void
}

interface Settled<T> {
  /** Which request this result belongs to. */
  requestKey: string
  data?: T
  error?: unknown
}

/**
 * Minimal request hook: one request per `key`, older in-flight requests are aborted so a slow
 * response can never overwrite a newer one, and the previous data stays visible while loading.
 * Pass `key: null` to skip fetching.
 *
 * Deliberately small instead of adding TanStack Query for a single page; see PR notes.
 */
export function useApiQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>
): ApiQuery<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>()
  const requestKey = key === null ? null : `${key}#${attempt}`

  // Read the latest fetcher inside the effect without making it a dependency.
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    if (requestKey === null) return
    const controller = new AbortController()
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSettled({ requestKey, data })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setSettled((prev) => ({ requestKey, data: prev?.data, error }))
      }
    )
    return () => controller.abort()
  }, [requestKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const isCurrent = requestKey !== null && settled?.requestKey === requestKey

  return {
    data: requestKey === null ? undefined : settled?.data,
    error: isCurrent ? settled.error : undefined,
    isFetching: requestKey !== null && !isCurrent,
    retry,
  }
}
