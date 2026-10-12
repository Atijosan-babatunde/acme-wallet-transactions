'use client'
import type { Transaction } from '@/types/api'
import { TransactionRow } from '@/components/transactions'
import { cx } from '@/lib/cx'
import { groupByDay } from '@/lib/transactions/display'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  items: Transaction[]
  /** A newer page/filter is loading: keep these visible but dimmed (Figma loading annotation). */
  isStale: boolean
  onSelect: (transaction: Transaction) => void
}

export function TransactionList({ items, isStale, onSelect }: TransactionListProps) {
  return (
    <div className={cx(styles.list, isStale && styles.stale)} aria-busy={isStale}>
      {groupByDay(items).map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h2 id={`day-${group.key}`} className={styles.day}>
            {group.label}
          </h2>
          {group.items.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} onSelect={onSelect} timeOnly />
          ))}
        </section>
      ))}
    </div>
  )
}
