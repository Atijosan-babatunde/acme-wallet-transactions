import type { Transaction, TransactionType } from '@/types/api'
import { formatDate } from '@/lib/format'

/**
 * Money coming in. Conversions count as credits because the API records them in the target
 * currency with `amount` = what the user received (the source debit is not a separate row).
 */
const CREDIT_TYPES: readonly TransactionType[] = ['deposit', 'transfer_in', 'conversion']

export const isCredit = (type: TransactionType) => CREDIT_TYPES.includes(type)

/** "Kwame Mensah" -> "KM", "Okonkwo-Adeyemi Logistics" -> "OA". */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export interface DayGroup {
  key: string
  label: string
  items: Transaction[]
}

/** Calendar day in the user's local time zone, e.g. "2026-10-05". */
const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * Group a newest-first list into "Today", "Yesterday" and dated sections, using the user's local
 * day (a 23:30 UTC transaction belongs to the next day in Lagos).
 */
export function groupByDay(items: Transaction[], now = new Date()): DayGroup[] {
  const today = localDayKey(now)
  const yesterday = localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))

  const groups: DayGroup[] = []
  for (const tx of items) {
    const key = localDayKey(new Date(tx.createdAt))
    let group = groups.at(-1)
    if (group?.key !== key) {
      const label = key === today ? 'Today' : key === yesterday ? 'Yesterday' : formatDate(tx.createdAt)
      group = { key, label, items: [] }
      groups.push(group)
    }
    group.items.push(tx)
  }
  return groups
}

/**
 * Page numbers to show, with gaps: first, last, and the current page's neighbours.
 * pageRange(1, 12) -> [1, 2, 3, 'gap', 12]; pageRange(6, 12) -> [1, 'gap', 5, 6, 7, 'gap', 12]
 */
export function pageRange(current: number, total: number): Array<number | 'gap'> {
  const pages = new Set([1, total, current - 1, current, current + 1])
  if (current <= 2) pages.add(3)
  if (current >= total - 1) pages.add(total - 2)

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: Array<number | 'gap'> = []
  sorted.forEach((page, i) => {
    const prev = sorted[i - 1]
    if (prev !== undefined && page - prev === 2) result.push(prev + 1)
    else if (prev !== undefined && page - prev > 2) result.push('gap')
    result.push(page)
  })
  return result
}
