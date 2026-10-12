import type { Transaction } from '@/types/api'
import { Money } from '@/components/ui'
import { formatDateTime, formatMoney, formatTime, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { isCredit } from '@/lib/transactions/display'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
  /** Inside a day group the date is already in the heading, so show only the time. */
  timeOnly?: boolean
}

export function TransactionRow({ transaction: tx, onSelect, timeOnly = false }: TransactionRowProps) {
  const credit = isCredit(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <span className={styles.icon}>
        <TransactionAvatar transaction={tx} />
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Narration comes from upstream providers unsanitised: always render as text. */}
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <span className={styles.status}>
        <StatusBadge status={tx.status} />
      </span>
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        <span className={styles.meta}>
          {timeOnly ? formatTime(tx.createdAt) : formatDateTime(tx.createdAt)}
          {!timeOnly && tx.fee > 0 && ` · Fee ${formatMoney(tx.fee, tx.currency)}`}
        </span>
      </span>
    </button>
  )
}
