'use client'
import type { PageMeta, Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { useApiQuery } from '@/lib/api/useApiQuery'
import type { TransactionFilters } from '@/lib/transactions/params'

export const PAGE_SIZE = 20

export function useTransactions(filters: TransactionFilters) {
  const query = {
    page: filters.page,
    limit: PAGE_SIZE,
    q: filters.q || undefined,
    type: filters.type,
    status: filters.status,
  }
  const result = useApiQuery<{ items: Transaction[]; meta?: PageMeta }>(
    JSON.stringify(query),
    async (signal) => {
      const res = await getTransactions(query, { signal })
      return { items: res.data, meta: res.meta }
    }
  )

  return {
    ...result,
    /** First load only: nothing to show yet. Later loads keep the previous page visible. */
    isInitialLoading: result.data === undefined && result.isFetching,
  }
}

/**
 * Details for the drawer. A transaction clicked in the list is shown instantly from list data;
 * one opened from a shared link (or not on the current page) is fetched by id.
 */
export function useTransactionDetails(id: string | undefined, fromList: Transaction[] | undefined) {
  const cached = id ? fromList?.find((tx) => tx.id === id) : undefined
  const result = useApiQuery<Transaction>(id && !cached ? id : null, async (signal) => {
    const res = await getTransaction(id!, { signal })
    return res.data
  })

  // Unlike the list, never show the previous transaction while a different one loads or fails.
  const fetched = result.isFetching || result.error ? undefined : result.data

  return {
    transaction: cached ?? fetched,
    isLoading: !cached && result.isFetching,
    notFound: result.error instanceof ApiError && result.error.status === 404,
    error: result.error,
    retry: result.retry,
  }
}
