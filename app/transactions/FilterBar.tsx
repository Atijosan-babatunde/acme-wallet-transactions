'use client'
import { useEffect, useState } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Input, Select } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import {
  hasActiveFilters,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionParams,
} from '@/lib/transactions/params'
import styles from './FilterBar.module.css'

const SEARCH_DEBOUNCE_MS = 300

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...TRANSACTION_TYPES.map((type) => ({ value: type, label: TRANSACTION_TYPE_LABELS[type] })),
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...TRANSACTION_STATUSES.map((status) => ({ value: status, label: TRANSACTION_STATUS_LABELS[status] })),
]

export interface FilterBarProps {
  params: TransactionParams
  onSearch: (q: string) => void
  onFilter: (patch: { type?: TransactionType; status?: TransactionStatus }) => void
  onClear: () => void
}

export function FilterBar({ params, onSearch, onFilter, onClear }: FilterBarProps) {
  // The input shows what the user is typing; the URL only gets it after a pause.
  const [draft, setDraft] = useState(params.q)
  // The last term we sent to the URL, and the last URL value we reconciled with.
  const [sent, setSent] = useState(params.q)
  const [syncedQ, setSyncedQ] = useState(params.q)

  // When the URL's q changes for a reason other than our own debounce (Back, Clear filters,
  // a pasted link), show it in the input. Our own updates are ignored so typing isn't overwritten.
  // (Adjusting state during render is React's recommended pattern for this.)
  if (params.q !== syncedQ) {
    setSyncedQ(params.q)
    if (params.q !== sent) setDraft(params.q)
  }

  useEffect(() => {
    const term = draft.trim()
    if (term === params.q) return
    const timer = setTimeout(() => {
      setSent(term)
      onSearch(term)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, params.q, onSearch])

  const showClear = hasActiveFilters(params) || draft.trim() !== ''

  return (
    <div className={styles.bar} role="search">
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        fieldClassName={styles.search}
        autoComplete="off"
        enterKeyHint="search"
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={params.type ?? ''}
        onChange={(event) => onFilter({ type: (event.target.value || undefined) as TransactionType })}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={params.status ?? ''}
        onChange={(event) => onFilter({ status: (event.target.value || undefined) as TransactionStatus })}
        fieldClassName={styles.status}
      />
      {showClear && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            setDraft('')
            setSent('')
            onClear()
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
