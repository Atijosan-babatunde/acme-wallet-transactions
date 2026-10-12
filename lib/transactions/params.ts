import type { TransactionStatus, TransactionType } from '@/types/api'

/**
 * The Transactions page keeps all of its state in the URL so that refresh, shared links and
 * Back/Forward restore exactly what the user was looking at. These helpers are the single place
 * that reads and writes those params; they are pure so they can be unit-tested without a router.
 */

export const TRANSACTION_TYPES: readonly TransactionType[] = [
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'conversion',
  'card_payment',
  'bill_payment',
]

// Figma also lists "Reversed", but the API only supports these three. See PR notes.
export const TRANSACTION_STATUSES: readonly TransactionStatus[] = ['successful', 'pending', 'failed']

export interface TransactionFilters {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  page: number
}

export interface TransactionParams extends TransactionFilters {
  /** Id of the transaction open in the details drawer. */
  txn?: string
}

/** Params owned by this page. Anything else in the URL (e.g. `__scenario`) is left untouched. */
const KEYS = ['q', 'type', 'status', 'page', 'txn'] as const

const isOneOf = <T extends string>(list: readonly T[], value: string | null): value is T =>
  value !== null && (list as readonly string[]).includes(value)

/** Read page state from the URL, dropping anything invalid instead of sending it to the API. */
export function parseParams(search: URLSearchParams): TransactionParams {
  const type = search.get('type')
  const status = search.get('status')
  const page = Number(search.get('page'))
  return {
    q: search.get('q')?.trim() ?? '',
    type: isOneOf(TRANSACTION_TYPES, type) ? type : undefined,
    status: isOneOf(TRANSACTION_STATUSES, status) ? status : undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    txn: search.get('txn') || undefined,
  }
}

export const hasActiveFilters = (params: TransactionFilters) =>
  Boolean(params.q || params.type || params.status)

/**
 * Apply a change and return the new query string (with leading "?", or "" when empty).
 * Changing a filter sends the user back to page 1, since their old page may no longer exist.
 * Defaults (page 1, empty search) are omitted to keep shared links short.
 */
export function buildSearch(current: URLSearchParams, patch: Partial<TransactionParams>): string {
  const next = { ...parseParams(current), ...patch }
  const filterChanged = 'q' in patch || 'type' in patch || 'status' in patch
  if (filterChanged && !('page' in patch)) next.page = 1

  const search = new URLSearchParams(current)
  for (const key of KEYS) search.delete(key)
  if (next.q.trim()) search.set('q', next.q.trim())
  if (next.type) search.set('type', next.type)
  if (next.status) search.set('status', next.status)
  if (next.page > 1) search.set('page', String(next.page))
  if (next.txn) search.set('txn', next.txn)

  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
