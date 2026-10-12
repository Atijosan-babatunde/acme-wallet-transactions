'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'
import { buildSearch, parseParams, type TransactionParams } from '@/lib/transactions/params'

/**
 * URL-backed state for the Transactions page. Must be rendered inside a <Suspense> boundary
 * because it reads useSearchParams.
 *
 * History policy:
 * - search terms `replace` (one history entry per keystroke would make Back useless)
 * - type/status filters and pages `push`, so Back steps through them
 * - opening details `push`es, so Back (or the Android back gesture) closes the drawer
 */
export function useTransactionParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useMemo(() => parseParams(new URLSearchParams(searchParams.toString())), [searchParams])

  // True when the open drawer was opened by a click on this page (we pushed its history entry).
  const openedInApp = useRef(false)

  const navigate = useCallback(
    (patch: Partial<TransactionParams>, mode: 'push' | 'replace') => {
      const search = buildSearch(new URLSearchParams(searchParams.toString()), patch)
      router[mode](`${pathname}${search}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return {
    params,
    setSearch: useCallback((q: string) => navigate({ q }, 'replace'), [navigate]),
    setFilters: useCallback(
      (patch: Pick<Partial<TransactionParams>, 'type' | 'status'>) => navigate(patch, 'push'),
      [navigate]
    ),
    clearFilters: useCallback(
      () => navigate({ q: '', type: undefined, status: undefined }, 'push'),
      [navigate]
    ),
    setPage: useCallback((page: number) => navigate({ page }, 'push'), [navigate]),
    openDetails: useCallback(
      (id: string) => {
        openedInApp.current = true
        navigate({ txn: id }, 'push')
      },
      [navigate]
    ),
    closeDetails: useCallback(() => {
      if (openedInApp.current) {
        // Pop the entry we pushed, so Back after closing doesn't reopen the drawer.
        openedInApp.current = false
        router.back()
      } else {
        // Opened from a shared link or refresh: there is no entry of ours to pop.
        navigate({ txn: undefined }, 'replace')
      }
    }, [navigate, router]),
  }
}
